import { getSupabaseClient } from '../lib/supabase';
import { Assembleia } from '../types';
import { StorageService } from './storageService';

export class AssembleiaService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getAssembleias(): Promise<Assembleia[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getAssembleias();
    }

    try {
      const { data, error } = await supabase
        .from('assembleias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[AssembleiaService] Erro ao buscar assembleias no Supabase:', error.message);
        return StorageService.getAssembleias();
      }

      if (data && data.length > 0) {
        const condominios = StorageService.getCondominios();
        const assembleias: Assembleia[] = data.map(row => {
          const condo = condominios.find(c => c.id === row.condominio_id);
          return {
            id: row.id,
            condominioId: row.condominio_id || '',
            condominioNome: condo?.nome || 'Condomínio',
            data: row.data || '',
            horario: row.horario || '',
            observacoes: row.observacoes || '',
            editalTexto: '',
            status: 'agendada'
          };
        });

        StorageService.saveAssembleias(assembleias);
        return assembleias;
      }

      return StorageService.getAssembleias();
    } catch (err) {
      console.warn('[AssembleiaService] Fallback para cache local:', err);
      return StorageService.getAssembleias();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createAssembleia(assembleia: Assembleia): Promise<{ success: boolean; data?: Assembleia; error?: string }> {
    const supabase = getSupabaseClient();
    const id = assembleia.id || crypto.randomUUID();

    const assObj: Assembleia = {
      ...assembleia,
      id
    };

    if (!supabase) {
      StorageService.saveAssembleia(assObj);
      return { success: true, data: assObj };
    }

    try {
      const dbPayload = {
        id,
        condominio_id: assObj.condominioId || null,
        data: assObj.data,
        horario: assObj.horario,
        observacoes: assObj.observacoes || '',
        edital_url: null,
        boleto_url: null,
        criado_por: null
      };

      const { error } = await supabase.from('assembleias').insert(dbPayload);

      if (error) {
        console.error('[AssembleiaService] Erro no INSERT de assembleia no Supabase:', error.message);
        return { success: false, error: error.message };
      }

      StorageService.saveAssembleia(assObj);
      return { success: true, data: assObj };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * UPDATE real no Supabase
   */
  public static async updateAssembleia(id: string, updates: Partial<Assembleia>): Promise<{ success: boolean; data?: Assembleia; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      const current = StorageService.getAssembleias().find(a => a.id === id);
      const updated = { ...(current || {}), ...updates, id } as Assembleia;
      StorageService.saveAssembleia(updated);
      return { success: true, data: updated };
    }

    try {
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.condominioId !== undefined) dbPayload.condominio_id = updates.condominioId;
      if (updates.data !== undefined) dbPayload.data = updates.data;
      if (updates.horario !== undefined) dbPayload.horario = updates.horario;
      if (updates.observacoes !== undefined) dbPayload.observacoes = updates.observacoes;

      const { error } = await supabase.from('assembleias').update(dbPayload).eq('id', id);

      if (error) return { success: false, error: error.message };

      const current = StorageService.getAssembleias().find(a => a.id === id);
      const updated = { ...(current || {}), ...updates, id } as Assembleia;
      StorageService.saveAssembleia(updated);
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * DELETE real no Supabase
   */
  public static async deleteAssembleia(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      StorageService.deleteAssembleia(id);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('assembleias').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      StorageService.deleteAssembleia(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
