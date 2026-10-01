import { getSupabaseClient } from '../../lib/supabase';
import { User, UserRole, UserStatus } from '../../types';

export class SupabaseUsersService {
  /**
   * Fetch all users from Supabase 'usuarios' table
   */
public static async getUsers(): Promise<User[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Erro ao carregar usuários do Supabase:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    nome: row.nome,
    email: row.email,
    cargo: row.cargo || 'Colaborador',
    role: row.is_master ? 'master' : 'colaborador',
    status: (row.status || 'pendente') as UserStatus,
    avatar: row.avatar_url || '',
    discordId: row.discord_id || undefined,
    criadoEm: row.created_at
  }));
}

  /**
   * Get user by ID
   */
public static async getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    cargo: data.cargo || 'Colaborador',
    role: data.is_master ? 'master' : 'colaborador',
    status: (data.status || 'pendente') as UserStatus,
    avatar: data.avatar_url || '',
    discordId: data.discord_id || undefined,
    criadoEm: data.created_at
  };
}

  /**
   * Approve a pending user (Master only)
   */
  public static async approveUser(
    userId: string,
    aprovadorNome: string,
    role: UserRole = 'colaborador',
    modulosPermitidos?: string[]
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const now = new Date();
    const stamp = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updatePayload: any = {
      status: 'ativo',
      role,
      aprovado_por: aprovadorNome,
      aprovado_em: stamp
    };

    if (modulosPermitidos) {
      updatePayload.permissoes = {
        modulosPermitidos,
        podeCriarTarefas: true,
        podeEditarCondominios: false,
        podeGerenciarXerox: true,
        podeGerenciarAssembleias: false
      };
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updatePayload)
      .eq('id', userId);

    return !error;
  }

  /**
   * Block a user
   */
  public static async blockUser(userId: string, motivo?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('usuarios')
      .update({
        status: 'bloqueado',
        motivo_bloqueio: motivo || 'Bloqueado pelo administrador'
      })
      .eq('id', userId);

    return !error;
  }

  /**
   * Reactivate a blocked user
   */
  public static async reactivateUser(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('usuarios')
      .update({
        status: 'ativo',
        motivo_bloqueio: null
      })
      .eq('id', userId);

    return !error;
  }

  /**
   * Update user details (Name, cargo, role, permissions, avatar)
   */
public static async updateUser(user: User): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .update({
      nome: user.nome,
      cargo: user.cargo,
      status: user.status,
      avatar_url: user.avatar,
      discord_id: user.discordId || null
    })
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    return false;
  }

  return true;
}

  /**
   * Delete user
   */
  public static async deleteUser(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId);

    return !error;
  }
}
