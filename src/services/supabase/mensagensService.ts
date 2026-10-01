import { getSupabaseClient } from '../../lib/supabase';
import { ChatMessage } from '../../types';

export class SupabaseMensagensService {
  public static async getMensagens(): Promise<ChatMessage[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('mensagens_chat')
      .select('*')
      .order('criada_em_iso', { ascending: true })
      .limit(100);

    if (error) {
      console.warn('Erro ao carregar mensagens do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      autorId: row.remetente_id || row.autor_id,
      autorNome: row.remetente_nome || row.autor_nome,
      autorAvatar: row.remetente_avatar || row.autor_avatar,
      autorRole: row.autor_role || 'colaborador',
      texto: row.conteudo || row.texto,
      dataHora: row.criada_em || row.data_hora
    }));
  }

  public static async enviarMensagem(mensagem: Omit<ChatMessage, 'id' | 'dataHora'>): Promise<ChatMessage | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const now = new Date();
    const stamp = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newId = `msg_${Date.now()}`;

    const payload = {
      id: newId,
      remetente_id: mensagem.autorId,
      remetente_nome: mensagem.autorNome,
      remetente_avatar: mensagem.autorAvatar,
      autor_id: mensagem.autorId,
      autor_nome: mensagem.autorNome,
      autor_avatar: mensagem.autorAvatar,
      autor_role: mensagem.autorRole,
      conteudo: mensagem.texto,
      texto: mensagem.texto,
      criada_em: stamp,
      data_hora: stamp,
      criada_em_iso: now.toISOString()
    };

    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert(payload)
      .select()
      .single();

    if (error) return null;

    return {
      id: data.id,
      autorId: data.remetente_id || data.autor_id,
      autorNome: data.remetente_nome || data.autor_nome,
      autorAvatar: data.remetente_avatar || data.autor_avatar,
      autorRole: data.autor_role || 'colaborador',
      texto: data.conteudo || data.texto,
      dataHora: data.criada_em || data.data_hora
    };
  }

  /**
   * Subscribe to real-time chat messages via Supabase Realtime
   */
  public static subscribeToMessages(onNewMessage: (msg: ChatMessage) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('chat_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_chat' },
        (payload: any) => {
          const row = payload.new;
          if (row) {
            onNewMessage({
              id: row.id,
              autorId: row.remetente_id || row.autor_id,
              autorNome: row.remetente_nome || row.autor_nome,
              autorAvatar: row.remetente_avatar || row.autor_avatar,
              autorRole: row.autor_role || 'colaborador',
              texto: row.conteudo || row.texto,
              dataHora: row.criada_em || row.data_hora
            });
          }
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
