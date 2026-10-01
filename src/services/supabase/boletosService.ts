import { getSupabaseClient } from '../../lib/supabase';
import { PeriodoProcesso, ProcessoCard } from '../../types';

export class SupabaseBoletosService {
  public static async getPeriodos(): Promise<PeriodoProcesso[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('boleto_periodos')
      .select('*')
      .order('mes_ano', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar períodos de boletos do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      tipo: 'boleto' as const,
      mes: row.mes || row.mes_ano?.split('/')[0] || '09',
      ano: row.ano || row.mes_ano?.split('/')[1] || '2026',
      mesAno: row.mes_ano,
      statusGeral: row.status_geral || (row.aberto ? 'Em andamento' : 'Concluída'),
      criadoEm: row.criado_em,
      criadoPor: row.criado_por || 'Fabrício'
    }));
  }

  public static async getCards(periodoId?: string): Promise<ProcessoCard[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    let query = supabase.from('boleto_cards').select('*');
    if (periodoId) {
      query = query.eq('periodo_id', periodoId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Erro ao carregar cards de boletos do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      periodoId: row.periodo_id,
      tipoProcesso: 'boleto' as const,
      condominioId: row.condominio_id,
      condominioNome: row.condominio_nome,
      responsavelId: row.responsavel_id,
      responsavelNome: row.responsavel_nome,
      prazo: row.prazo || '2026-09-30',
      status: row.status || 'Pendente',
      checklist: row.checklist || [],
      informacoesAdicionais: row.observacoes || row.informacoes_adicionais || '',
      comentarios: row.comentarios || [],
      concluidoEm: row.concluido_em,
      concluidoPor: row.concluida_por
    }));
  }

  public static async saveCard(card: ProcessoCard): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: card.id,
      periodo_id: card.periodoId,
      tipo_processo: card.tipoProcesso,
      condominio_id: card.condominioId,
      condominio_nome: card.condominioNome,
      responsavel_id: card.responsavelId,
      responsavel_nome: card.responsavelNome,
      prazo: card.prazo,
      status: card.status,
      checklist: card.checklist,
      observacoes: card.informacoesAdicionais,
      informacoes_adicionais: card.informacoesAdicionais,
      comentarios: card.comentarios,
      concluido_em: card.concluidoEm,
      concluida_por: card.concluidoPor
    };

    const { error } = await supabase.from('boleto_cards').upsert(payload);
    return !error;
  }
}
