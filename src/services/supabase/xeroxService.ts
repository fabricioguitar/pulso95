import { getSupabaseClient } from '../../lib/supabase';
import { XeroxRegistro } from '../../types';

export class SupabaseXeroxService {
  public static async getRegistros(): Promise<XeroxRegistro[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('xerox_registros')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar xerox do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      condominioId: row.condominio_id,
      condominioNome: row.condominio_nome,
      data: row.data || row.criado_em || '',
      tipo: (row.tipo || (row.quantidade_colorida > 0 ? 'colorida' : 'preto_branco')) as 'preto_branco' | 'colorida',
      quantidade: row.quantidade || row.quantidade_pb || row.quantidade_colorida || 0,
      valorUnitario: Number(row.valor_unitario || (row.valor_total / (row.quantidade || 1)) || 0.20),
      valorTotal: Number(row.valor_total) || 0,
      informacoesAdicionais: row.observacoes || row.informacoes_adicionais || '',
      registradoPor: row.registrado_por || row.criado_por || 'Fabrício'
    }));
  }

  public static async saveRegistro(registro: XeroxRegistro): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: registro.id,
      condominio_id: registro.condominioId,
      condominio_nome: registro.condominioNome,
      data: registro.data,
      tipo: registro.tipo,
      quantidade: registro.quantidade,
      quantidade_pb: registro.tipo === 'preto_branco' ? registro.quantidade : 0,
      quantidade_colorida: registro.tipo === 'colorida' ? registro.quantidade : 0,
      valor_unitario: registro.valorUnitario,
      valor_total: registro.valorTotal,
      informacoes_adicionais: registro.informacoesAdicionais,
      observacoes: registro.informacoesAdicionais,
      registrado_por: registro.registradoPor,
      criado_por: registro.registradoPor
    };

    const { error } = await supabase.from('xerox_registros').upsert(payload);
    return !error;
  }

  public static async deleteRegistro(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('xerox_registros').delete().eq('id', id);
    return !error;
  }
}
