import { getSupabaseClient } from '../../lib/supabase';
import { Assembleia } from '../../types';

export class SupabaseAssembleiasService {
  public static async getAssembleias(): Promise<Assembleia[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('assembleias')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar assembleias do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      condominioId: row.condominio_id,
      condominioNome: row.condominio_nome,
      data: row.data || '',
      horario: row.horario || '',
      status: (row.status || 'agendada') as 'agendada' | 'realizada' | 'cancelada',
      editalTexto: row.edital_texto,
      editalArquivo: row.edital_arquivo,
      boletoArquivo: row.boleto_arquivo,
      informacoesBoleto: row.informacoes_boleto,
      emailsAdicionais: row.emails_adicionais,
      observacoes: row.observacoes || ''
    }));
  }

  public static async saveAssembleia(assembleia: Assembleia): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: assembleia.id,
      condominio_id: assembleia.condominioId,
      condominio_nome: assembleia.condominioNome,
      data: assembleia.data,
      horario: assembleia.horario,
      status: assembleia.status,
      edital_texto: assembleia.editalTexto,
      edital_arquivo: assembleia.editalArquivo,
      boleto_arquivo: assembleia.boletoArquivo,
      informacoes_boleto: assembleia.informacoesBoleto,
      emails_adicionais: assembleia.emailsAdicionais,
      observacoes: assembleia.observacoes
    };

    const { error } = await supabase.from('assembleias').upsert(payload);
    return !error;
  }

  public static async deleteAssembleia(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('assembleias').delete().eq('id', id);
    return !error;
  }
}
