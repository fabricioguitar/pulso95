import { getSupabaseClient } from '../../lib/supabase';
import { User } from '../../types';

export class SupabaseAuthService {
  /**
   * Real sign in with Email & Password via Supabase Auth
   */
  public static async signInWithPassword(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase não está configurado.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Real sign up with Email & Password via Supabase Auth
   */
  public static async signUp(data: {
    email: string;
    password: string;
    nome: string;
    cargo?: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase não está configurado.');
    }

    const isMasterFab =
      data.email.toLowerCase().trim() === 'fabricioguitar82@gmail.com' ||
      data.email.toLowerCase().trim() === 'fabricio@peniel.com.br' ||
      data.nome.toLowerCase().trim() === 'fabrício' ||
      data.nome.toLowerCase().trim() === 'fabricio';

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          nome: data.nome.trim(),
          cargo: isMasterFab ? 'Master / Administrador' : (data.cargo || 'Colaborador'),
          role: isMasterFab ? 'master' : 'colaborador',
          status: isMasterFab ? 'ativo' : 'pendente' // Fabrício is Ativo; other new users are Pendente
        }
      }
    });

    if (error) throw error;
    return authData;
  }

  /**
   * OAuth login with Google via Supabase Auth
   */
  public static async signInWithGoogle() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase não está configurado.');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out from Supabase Auth
   */
  public static async signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Password recovery request via Supabase Auth
   */
  public static async resetPasswordForEmail(email: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase não está configurado.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get current auth session from Supabase
   */
  public static async getSession() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Listen for Supabase auth state transitions
   */
  public static onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return { unsubscribe: () => {} };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return subscription;
  }
}
