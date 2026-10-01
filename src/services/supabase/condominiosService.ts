import { getSupabaseClient } from '../../lib/supabase';
import { Condominio } from '../../types';

export class SupabaseCondominiosService {
  /**
   * Fetch all condominiums
   */
  public static async getCondominios(): Promise<Condominio[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.warn('Erro ao carregar condomínios do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      nome: row.nome,
      responsavelId: row.responsavel_id || '',
      responsavelNome: row.responsavel_nome || 'Fabrício',
      valorSalaoFestas: Number(row.valor_salao_festas) || 0,
      valorChurrasqueira: Number(row.valor_churrasqueira) || 0,
      valorMultaLeve: Number(row.valor_multa_leve) || 0,
      valorMultaMedia: Number(row.valor_multa_media) || 0,
      valorMultaGrave: Number(row.valor_multa_grave) || 0,
      unidades: row.unidades,
      endereco: row.endereco
    }));
  }

  /**
   * Create or update a condominium
   */
  public static async saveCondominio(condominio: Condominio): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: condominio.id,
      nome: condominio.nome,
      responsavel_id: condominio.responsavelId,
      responsavel_nome: condominio.responsavelNome,
      valor_salao_festas: condominio.valorSalaoFestas,
      valor_churrasqueira: condominio.valorChurrasqueira,
      valor_multa_leve: condominio.valorMultaLeve,
      valor_multa_media: condominio.valorMultaMedia,
      valor_multa_grave: condominio.valorMultaGrave,
      unidades: condominio.unidades,
      endereco: condominio.endereco
    };

    const { error } = await supabase
      .from('condominios')
      .upsert(payload);

    return !error;
  }

  /**
   * Delete condominium
   */
  public static async deleteCondominio(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Batch seed condominiums into Supabase
   */
  public static async seedCondominios(condos: Condominio[]): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const rows = condos.map(c => ({
      id: c.id,
      nome: c.nome,
      responsavel_id: c.responsavelId,
      responsavel_nome: c.responsavelNome,
      valor_salao_festas: c.valorSalaoFestas,
      valor_churrasqueira: c.valorChurrasqueira,
      valor_multa_leve: c.valorMultaLeve,
      valor_multa_media: c.valorMultaMedia,
      valor_multa_grave: c.valorMultaGrave,
      unidades: c.unidades,
      endereco: c.endereco
    }));

    const { error } = await supabase
      .from('condominios')
      .upsert(rows, { onConflict: 'nome' });

    return !error;
  }
}
