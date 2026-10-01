import { getSupabaseClient } from '../lib/supabase';
import { ChatMessage } from '../types';
import { StorageService } from './storageService';

export class MensagemService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getMensagens(): Promise<ChatMessage[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getChatMessages();
    }

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[MensagemService] Erro ao carregar mensagens no Supabase:', error.message);
        return StorageService.getChatMessages();
      }

      if (data && data.length > 0) {
        const users = StorageService.getUsers();
        const mensagens: ChatMessage[] = data.map(row => {
          const user = users.find(u => u.id === row.autor_id);
          return {
            id: row.id,
            autorId: row.autor_id || 'user_fabricio',
            autorNome: user?.nome || 'Fabrício',
            autorAvatar: user?.avatar,
            autorRole: user?.role || 'master',
            texto: row.mensagem,
            dataHora: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : ''
          };
        });

        StorageService.saveChatMessages(mensagens);
        return mensagens;
      }

      return StorageService.getChatMessages();
    } catch (err) {
      console.warn('[MensagemService] Fallback para cache local:', err);
      return StorageService.getChatMessages();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async sendMensagem(texto: string, autor: { id: string; nome: string; role?: string; avatar?: string }): Promise<ChatMessage> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();

    const newMsg: ChatMessage = {
      id,
      autorId: autor.id,
      autorNome: autor.nome,
      autorRole: autor.role || 'colaborador',
      autorAvatar: autor.avatar,
      texto,
      dataHora: new Date().toLocaleString('pt-BR')
    };

    StorageService.addChatMessage(newMsg);

    if (supabase) {
      try {
        await supabase.from('mensagens').insert({
          id,
          autor_id: autor.id && autor.id.length > 20 ? autor.id : null,
          mensagem: texto
        });
      } catch (e) {
        console.warn('Erro ao inserir mensagem no Supabase:', e);
      }
    }

    return newMsg;
  }

  /**
   * Subscribe to real-time messages in Supabase
   */
  public static subscribeToMensagens(onNewMessage: (msg: ChatMessage) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('realtime_mensagens')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens' },
        (payload) => {
          const row = payload.new;
          const users = StorageService.getUsers();
          const user = users.find(u => u.id === row.autor_id);
          const msg: ChatMessage = {
            id: row.id,
            autorId: row.autor_id || '',
            autorNome: user?.nome || 'Colaborador',
            autorAvatar: user?.avatar,
            autorRole: user?.role || 'colaborador',
            texto: row.mensagem,
            dataHora: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : ''
          };
          onNewMessage(msg);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
}
