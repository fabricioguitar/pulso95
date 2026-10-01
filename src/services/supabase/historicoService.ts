import { getSupabaseClient } from '../../lib/supabase';
import { HistoricoItem } from '../../types';

export class SupabaseHistoricoService {
  public static async getLogs(limit = 100): Promise<HistoricoItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('historico_logs')
      .select('*')
      .order('timestamp_iso', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Erro ao carregar histórico do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      usuarioId: row.usuario_id || '',
      usuarioNome: row.usuario_nome,
      acao: row.acao,
      modulo: row.modulo,
      item: row.item || '',
      valorAnterior: row.valor_anterior,
      valorNovo: row.valor_novo,
      dataHora: row.data_hora_formatada
    }));
  }

  public static async addLog(entry: Omit<HistoricoItem, 'id' | 'dataHora'>): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const now = new Date();
    const payload = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.getTime(),
      timestamp_iso: now.toISOString(),
      data_hora_formatada: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      usuario_id: entry.usuarioId,
      usuario_nome: entry.usuarioNome,
      modulo: entry.modulo,
      acao: entry.acao,
      item: entry.item,
      valor_anterior: entry.valorAnterior,
      valor_novo: entry.valorNovo
    };

    const { error } = await supabase.from('historico_logs').insert(payload);
    return !error;
  }
}
