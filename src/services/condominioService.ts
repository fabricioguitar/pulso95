import { getSupabaseClient, ensureUUID, isUUID } from '../lib/supabase';
import { Condominio } from '../types';
import { StorageService } from './storageService';

export class CondominioService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getCondominios(): Promise<Condominio[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getCondominios();
    }

    try {
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) {
        console.warn('[CondominioService] Erro ao buscar condomínios no Supabase:', error.message);
        return StorageService.getCondominios();
      }

      if (data && data.length > 0) {
        const condominios: Condominio[] = data.map(row => ({
          id: row.id,
          nome: row.nome,
          responsavelId: 'user_fabricio',
          responsavelNome: 'Fabrício',
          valorSalaoFestas: Number(row.valor_salao) || 0,
          valorChurrasqueira: Number(row.valor_churrasqueira) || 0,
          valorMultaLeve: Number(row.valor_multa_leve) || 0,
          valorMultaMedia: Number(row.valor_multa_media) || 0,
          valorMultaGrave: Number(row.valor_multa_grave) || 0
        }));

        // Atualizar cache LocalStorage com os dados oficiais
        StorageService.saveCondominios(condominios);
        return condominios;
      }

      // Se o banco estiver vazio, usa o cache local inicial
      return StorageService.getCondominios();
    } catch (err) {
      console.warn('[CondominioService] Fallback para cache local:', err);
      return StorageService.getCondominios();
    }
  }

  /**
   * ESCRITA: interface -> service -> Supabase -> aguardar sucesso -> interface -> LocalStorage cache
   */
  public static async createCondominio(condominio: Omit<Condominio, 'id'> | Condominio): Promise<{ success: boolean; data?: Condominio; error?: string }> {
    const supabase = getSupabaseClient();
    const id = ('id' in condominio && condominio.id && isUUID(condominio.id)) ? condominio.id : crypto.randomUUID();

    const dbPayload = {
      id,
      nome: condominio.nome.trim(),
      valor_salao: Number(condominio.valorSalaoFestas) || 0,
      valor_churrasqueira: Number(condominio.valorChurrasqueira) || 0,
      valor_multa_leve: Number(condominio.valorMultaLeve) || 0,
      valor_multa_media: Number(condominio.valorMultaMedia) || 0,
      valor_multa_grave: Number(condominio.valorMultaGrave) || 0,
      ativo: true
    };

    const newCondominio: Condominio = {
      id,
      nome: condominio.nome.trim(),
      responsavelId: ('responsavelId' in condominio && condominio.responsavelId) ? condominio.responsavelId : 'user_fabricio',
      responsavelNome: ('responsavelNome' in condominio && condominio.responsavelNome) ? condominio.responsavelNome : 'Fabrício',
      valorSalaoFestas: dbPayload.valor_salao,
      valorChurrasqueira: dbPayload.valor_churrasqueira,
      valorMultaLeve: dbPayload.valor_multa_leve,
      valorMultaMedia: dbPayload.valor_multa_media,
      valorMultaGrave: dbPayload.valor_multa_grave
    };

    if (!supabase) {
      StorageService.saveCondominio(newCondominio);
      return { success: true, data: newCondominio };
    }

    try {
      const { data, error } = await supabase
        .from('condominios')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('[CondominioService] Erro no INSERT Supabase:', error.message);
        // Supabase é a única fonte oficial. Se falhar, NÃO grava como registro oficial no LocalStorage.
        return { success: false, error: error.message };
      }

      // Sucesso confirmado no Supabase -> Atualiza o cache do LocalStorage
      const savedCondo: Condominio = {
        ...newCondominio,
        id: data.id,
        nome: data.nome
      };
      StorageService.saveCondominio(savedCondo);
      return { success: true, data: savedCondo };
    } catch (err: any) {
      console.error('[CondominioService] Exceção no INSERT Supabase:', err);
      return { success: false, error: err.message || 'Erro inesperado ao salvar no Supabase' };
    }
  }

  /**
   * UPDATE real no Supabase
   */
  public static async updateCondominio(id: string, updates: Partial<Condominio>): Promise<{ success: boolean; data?: Condominio; error?: string }> {
    const supabase = getSupabaseClient();

    const dbPayload: Record<string, any> = {};

    if (updates.nome !== undefined) dbPayload.nome = updates.nome.trim();
    if (updates.valorSalaoFestas !== undefined) dbPayload.valor_salao = Number(updates.valorSalaoFestas) || 0;
    if (updates.valorChurrasqueira !== undefined) dbPayload.valor_churrasqueira = Number(updates.valorChurrasqueira) || 0;
    if (updates.valorMultaLeve !== undefined) dbPayload.valor_multa_leve = Number(updates.valorMultaLeve) || 0;
    if (updates.valorMultaMedia !== undefined) dbPayload.valor_multa_media = Number(updates.valorMultaMedia) || 0;
    if (updates.valorMultaGrave !== undefined) dbPayload.valor_multa_grave = Number(updates.valorMultaGrave) || 0;

    if (!supabase || !isUUID(id)) {
      const current = StorageService.getCondominioById(id);
      const updated = { ...(current || {}), ...updates, id } as Condominio;
      StorageService.saveCondominio(updated);
      return { success: true, data: updated };
    }

    try {
      const { data, error } = await supabase
        .from('condominios')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[CondominioService] Erro no UPDATE Supabase:', error.message);
        return { success: false, error: error.message };
      }

      // Sucesso confirmado no Supabase -> atualiza cache
      const current = StorageService.getCondominioById(id);
      const updated = { ...(current || {}), ...updates, id } as Condominio;
      StorageService.saveCondominio(updated);

      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * DELETE real no Supabase
   */
  public static async deleteCondominio(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase || !isUUID(id)) {
      StorageService.deleteCondominio(id);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('condominios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[CondominioService] Erro no DELETE Supabase:', error.message);
        return { success: false, error: error.message };
      }

      // Sucesso confirmado no Supabase -> remove do cache
      StorageService.deleteCondominio(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

