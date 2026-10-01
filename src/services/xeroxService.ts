import { getSupabaseClient, isUUID } from '../lib/supabase';
import { XeroxRegistro } from '../types';
import { StorageService } from './storageService';

export class XeroxService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getXeroxRegistros(): Promise<XeroxRegistro[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getXeroxRegistros();
    }

    try {
      const { data, error } = await supabase
        .from('xerox')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[XeroxService] Erro ao buscar registros de xerox no Supabase:', error.message);
        return StorageService.getXeroxRegistros();
      }

      if (data && data.length > 0) {
        const condominios = StorageService.getCondominios();
        const registros: XeroxRegistro[] = data.map(row => {
          const condo = condominios.find(c => c.id === row.condominio_id);
          return {
            id: row.id,
            condominioId: row.condominio_id || '',
            condominioNome: condo?.nome || 'Condomínio',
            data: row.data || '',
            tipo: row.tipo || 'preto_branco',
            quantidade: Number(row.quantidade) || 0,
            valorUnitario: Number(row.valor_unitario) || 0,
            valorTotal: Number(row.valor_total) || 0,
            informacoesAdicionais: row.observacoes || '',
            registradoPor: 'Fabrício'
          };
        });

        StorageService.saveXeroxRegistros(registros);
        return registros;
      }

      return StorageService.getXeroxRegistros();
    } catch (err) {
      console.warn('[XeroxService] Fallback para cache local:', err);
      return StorageService.getXeroxRegistros();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createXeroxRegistro(registro: XeroxRegistro): Promise<{ success: boolean; data?: XeroxRegistro; error?: string }> {
    const supabase = getSupabaseClient();
    const id = registro.id || crypto.randomUUID();

    const regObj: XeroxRegistro = {
      ...registro,
      id
    };

    if (!supabase) {
      StorageService.saveXeroxRegistro(regObj);
      return { success: true, data: regObj };
    }

    try {
      let finalCondominioId = regObj.condominioId;

      if (finalCondominioId && !isUUID(finalCondominioId)) {
        const condominios = StorageService.getCondominios();
        const localCondo = condominios.find(c => c.id === finalCondominioId);
        
        if (localCondo) {
          const { data: condoData, error: condoError } = await supabase
            .from('condominios')
            .select('id')
            .eq('nome', localCondo.nome)
            .single();
            
          if (condoError || !condoData) {
            return { success: false, error: 'O condomínio associado precisa estar sincronizado no Supabase primeiro.' };
          }
          finalCondominioId = condoData.id;
        } else {
          return { success: false, error: 'O condomínio associado não foi encontrado localmente.' };
        }
      }

      const dbPayload = {
        id,
        condominio_id: finalCondominioId || null,
        tipo: regObj.tipo,
        data: regObj.data,
        quantidade: regObj.quantidade,
        valor_unitario: regObj.valorUnitario,
        observacoes: regObj.informacoesAdicionais || '',
        criado_por: null
      };

      const { error } = await supabase.from('xerox').insert(dbPayload);

      if (error) {
        console.error('[XeroxService] Erro no INSERT de xerox no Supabase:', error.message);
        return { success: false, error: error.message };
      }

      StorageService.saveXeroxRegistro(regObj);
      return { success: true, data: regObj };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * DELETE real no Supabase
   */
  public static async deleteXeroxRegistro(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      StorageService.deleteXeroxRegistro(id);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('xerox').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      StorageService.deleteXeroxRegistro(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
