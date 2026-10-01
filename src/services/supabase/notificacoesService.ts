import { getSupabaseClient } from '../../lib/supabase';
import { Notificacao } from '../../types';

export class SupabaseNotificacoesService {
  public static async getNotificacoes(): Promise<Notificacao[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .order('criada_em', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Erro ao carregar notificações do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      tipo: row.tipo,
      criadaEm: row.criada_em,
      lida: row.lida || false,
      linkTab: row.link_tab
    }));
  }

  public static async addNotificacao(notif: Omit<Notificacao, 'id' | 'criadaEm' | 'lida'>): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: `notif_${Date.now()}`,
      titulo: notif.titulo,
      descricao: notif.descricao,
      tipo: notif.tipo,
      lida: false,
      link_tab: notif.linkTab,
      criada_em: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };

    const { error } = await supabase.from('notificacoes').insert(payload);
    return !error;
  }

  public static async markAsRead(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    return !error;
  }

  public static async markAllAsRead(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('lida', false);
    return !error;
  }
}
