import { getSupabaseClient } from '../lib/supabase';
import { Notificacao } from '../types';
import { StorageService } from './storageService';

export class NotificacaoService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getNotificacoes(): Promise<Notificacao[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getNotificacoes();
    }

    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[NotificacaoService] Erro ao carregar notificacoes:', error.message);
        return StorageService.getNotificacoes();
      }

      if (data && data.length > 0) {
        const notifs: Notificacao[] = data.map(row => ({
          id: row.id,
          titulo: row.titulo,
          descricao: row.mensagem || '',
          tipo: (row.tipo as any) || 'sistema',
          lida: Boolean(row.lida),
          criadaEm: row.created_at ? new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
        }));

        StorageService.saveNotificacoes(notifs);
        return notifs;
      }

      return StorageService.getNotificacoes();
    } catch {
      return StorageService.getNotificacoes();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createNotificacao(
    titulo: string,
    mensagem: string,
    tipo: 'tarefa' | 'mencao' | 'prazo' | 'atraso' | 'chat' | 'balancete' | 'sistema' = 'sistema',
    usuarioId?: string
  ): Promise<Notificacao> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();

    const notif: Notificacao = {
      id,
      titulo,
      descricao: mensagem,
      tipo,
      lida: false,
      criadaEm: 'Agora'
    };

    StorageService.addNotificacao(notif);

    if (supabase) {
      try {
        await supabase.from('notificacoes').insert({
          id,
          usuario_id: usuarioId && usuarioId.length > 20 ? usuarioId : null,
          titulo,
          tipo,
          mensagem,
          lida: false
        });
      } catch (e) {
        console.warn('Erro ao inserir notificação no Supabase:', e);
      }
    }

    return notif;
  }

  /**
   * Marcar como lida
   */
  public static async markAsRead(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    StorageService.markNotificacaoLida(id);

    if (supabase) {
      try {
        await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
      } catch (e) {
        console.warn('Erro ao marcar notificação como lida no Supabase:', e);
      }
    }
  }

  /**
   * Marcar todas como lidas
   */
  public static async markAllAsRead(): Promise<void> {
    const supabase = getSupabaseClient();
    StorageService.markAllNotificacoesLidas();

    if (supabase) {
      try {
        await supabase.from('notificacoes').update({ lida: true }).eq('lida', false);
      } catch (e) {
        console.warn('Erro ao marcar todas notificações como lidas no Supabase:', e);
      }
    }
  }
}
