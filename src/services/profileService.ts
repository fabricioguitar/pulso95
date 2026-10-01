import { getSupabaseClient } from '../lib/supabase';
import { User, UserStatus } from '../types';
import { StorageService } from './storageService';

export class ProfileService {
  /**
   * Fetch all profiles from public.profiles
   */
  public static async getProfiles(): Promise<User[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getUsers();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.warn('[ProfileService] Erro ao carregar profiles:', error.message);
        return StorageService.getUsers();
      }

      if (!data || data.length === 0) {
        // Fallback to cache if database has no profiles yet
        return StorageService.getUsers();
      }

      const users: User[] = data.map(row => ({
        id: row.id,
        nome: row.nome || 'Usuário',
        email: row.email || '',
        cargo: row.cargo || 'Colaborador',
        role: row.is_master ? 'master' : 'colaborador',
        status: row.status || 'pendente',
        avatar: row.avatar_url || '',
        criadoEm: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : undefined
      }));

      // Update LocalStorage cache with official records
      return users;
    } catch (err) {
      console.warn('[ProfileService] Erro inesperado:', err);
      return StorageService.getUsers();
    }
  }

  /**
   * Get single profile by ID
   */
  public static async getProfileById(id: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getUserById(id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return StorageService.getUserById(id) || null;
      }

      return {
        id: data.id,
        nome: data.nome,
        email: data.email,
        cargo: data.cargo,
        role: data.is_master ? 'master' : 'colaborador',
        status: data.status,
        avatar: data.avatar_url || ''
      };
    } catch {
      return StorageService.getUserById(id) || null;
    }
  }

  /**
   * Update profile status (Aprovação / Bloqueio pelo Master)
   */
  public static async updateProfileStatus(id: string, status: UserStatus, motivoBloqueio?: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    // Update local cache
    StorageService.updateUserStatus(id, status, motivoBloqueio);

    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.warn('[ProfileService] Falha ao atualizar status no Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save or update profile
   */
  public static async saveProfile(user: User): Promise<boolean> {
    const supabase = getSupabaseClient();

    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          status: user.status,
          is_master: user.role === 'master',
          avatar_url: user.avatar || '',
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete profile
   */
  public static async deleteProfile(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    StorageService.deleteUser(id);

    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }
}
