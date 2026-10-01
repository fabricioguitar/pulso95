import { getSupabaseClient } from '../lib/supabase';
import { User } from '../types';
import { StorageService } from './storageService';

export interface AuthResponse {
  user: User | null;
  error?: string;
  isPendingApproval?: boolean;
}

export class AuthService {
  /**
   * Real Supabase Auth: Sign Up with email, password, and metadata
   */
  public static async signUp(
    email: string,
    password: string,
    nome: string,
    cargo: string = 'Colaborador'
  ): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const cleanNome = nome.trim();
    const isFabricio = cleanEmail === 'fabricioguitar82@gmail.com' || cleanNome.toLowerCase().includes('fabricio');

    if (!supabase) {
      // Offline fallback
      const localUser = StorageService.registerNewUser({
        nome: cleanNome,
        email: cleanEmail,
        cargo
      });
      return { user: localUser, isPendingApproval: false };
    }

    try {
      // Automatic profile creation requirements:
      // status = 'ativo', is_master = false (unless Master Fabrício)
      const isMasterUser = Boolean(isFabricio);
      const userStatus = 'ativo';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nome: cleanNome,
            cargo,
            is_master: isMasterUser,
            status: userStatus
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      const authUser = data.user;
      if (!authUser) {
        return { user: null, error: 'Não foi possível criar o usuário no Supabase.' };
      }

      // Check profile in public.profiles (either created by trg_on_auth_user_created or via upsert)
      let profileUser: User = {
        id: authUser.id,
        nome: cleanNome,
        email: cleanEmail,
        cargo,
        role: isMasterUser ? 'master' : 'colaborador',
        status: 'ativo',
        avatar: '',
        criadoEm: new Date().toLocaleDateString('pt-BR')
      };

      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (existingProfile) {
          profileUser = {
            id: existingProfile.id,
            nome: existingProfile.nome || cleanNome,
            email: existingProfile.email || cleanEmail,
            cargo: existingProfile.cargo || cargo,
            role: existingProfile.is_master ? 'master' : 'colaborador',
            status: existingProfile.status || 'ativo',
            avatar: existingProfile.avatar_url || '',
            criadoEm: existingProfile.created_at ? new Date(existingProfile.created_at).toLocaleDateString('pt-BR') : profileUser.criadoEm
          };
        } else {
          // If trigger didn't create profile yet or is pending, create/ensure profile
          await supabase.from('profiles').upsert({
            id: authUser.id,
            nome: cleanNome,
            email: cleanEmail,
            cargo,
            status: 'ativo',
            is_master: isMasterUser,
            avatar_url: ''
          });
        }
      } catch (profErr) {
        console.warn('[AuthService] Verificação de profile:', profErr);
      }

      // Sync local cache com os dados oficiais do Supabase
      StorageService.setCurrentUserId(authUser.id);
      StorageService.setSessionActive(true);
      StorageService.registerNewUser(profileUser);

      return {
        user: profileUser,
        isPendingApproval: false
      };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro inesperado ao realizar cadastro.' };
    }
  }

  /**
   * Real Supabase Auth: Sign In with email & password
   */
  public static async signIn(email: string, password?: string): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!supabase) {
      const users = StorageService.getUsers();
      const found = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (found) {
        StorageService.setCurrentUserId(found.id);
        StorageService.setSessionActive(true);
        return { user: found };
      }
      return { user: null, error: 'Usuário não encontrado localmente.' };
    }

    try {
      if (!password) {
        return { user: null, error: 'Senha é obrigatória para autenticação.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Fetch profile from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const isFabricio = cleanEmail === 'fabricioguitar82@gmail.com';
        const userObj: User = {
          id: data.user.id,
          nome: profile?.nome || data.user.user_metadata?.nome || 'Usuário',
          email: cleanEmail,
          cargo: profile?.cargo || data.user.user_metadata?.cargo || 'Colaborador',
          role: (profile?.is_master || isFabricio) ? 'master' : 'colaborador',
          status: profile?.status || 'ativo',
          avatar: profile?.avatar_url || ''
        };

        // Atualizar cache de sessão
        StorageService.setCurrentUserId(userObj.id);
        StorageService.setSessionActive(true);

        return { user: userObj, isPendingApproval: userObj.status === 'pendente' };
      }

      return { user: null, error: 'Sessão inválida.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro ao realizar login.' };
    }
  }

  /**
   * Real Supabase Auth: Google OAuth
   */
  public static async signInWithGoogle(): Promise<{ error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: 'Cliente Supabase não configurado.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Erro ao iniciar autenticação com Google.' };
    }
  }

  /**
   * Real Supabase Auth: Sign Out
   */
  public static async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Aviso no sign out do Supabase:', e);
    } finally {
      StorageService.setSessionActive(false);
    }
  }

  /**
   * Reset password via email
   */
  public static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase não conectado.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Update password for current authenticated user
   */
  public static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase não conectado.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Listen to Supabase auth state changes
   */
  public static onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return { unsubscribe: () => {} };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const isFabricio = session.user.email?.toLowerCase() === 'fabricioguitar82@gmail.com';
          const userObj: User = {
            id: session.user.id,
            nome: profile?.nome || session.user.user_metadata?.nome || 'Usuário',
            email: session.user.email || '',
            cargo: profile?.cargo || session.user.user_metadata?.cargo || 'Colaborador',
            role: (profile?.is_master || isFabricio) ? 'master' : 'colaborador',
            status: profile?.status || 'ativo',
            avatar: profile?.avatar_url || ''
          };
          callback(userObj);
        } catch {
          const isFabricio = session.user.email?.toLowerCase() === 'fabricioguitar82@gmail.com';
          const fallbackUser: User = {
            id: session.user.id,
            nome: session.user.user_metadata?.nome || 'Usuário',
            email: session.user.email || '',
            cargo: session.user.user_metadata?.cargo || 'Colaborador',
            role: isFabricio ? 'master' : 'colaborador',
            status: 'ativo',
            avatar: ''
          };
          callback(fallbackUser);
        }
      } else {
        callback(null);
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}
