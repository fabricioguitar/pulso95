import { getSupabaseClient, isUUID } from '../lib/supabase';
import { ProcessoCard, ProcessoChecklistItem } from '../types';
import { StorageService } from './storageService';

const ETAPAS_BOLETO = ['Consumos', 'Emissão', 'Análise', 'Ajustes', 'Envio'];

export class BoletoService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getBoletos(): Promise<ProcessoCard[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getProcessoCards('boleto');
    }

    try {
      const { data: boletosData, error } = await supabase
        .from('boletos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[BoletoService] Erro ao buscar boletos no Supabase:', error.message);
        return StorageService.getProcessoCards('boleto');
      }

      if (boletosData && boletosData.length > 0) {
        const { data: stepsData } = await supabase.from('boleto_steps').select('*');
        const condominios = StorageService.getCondominios();
        const users = StorageService.getUsers();

        const cards: ProcessoCard[] = boletosData.map(row => {
          const condo = condominios.find(c => c.id === row.condominio_id);
          const resp = users.find(u => u.id === row.responsavel_id);

          const cardSteps = (stepsData || []).filter(s => s.boleto_id === row.id);
          const checklist: ProcessoChecklistItem[] = ETAPAS_BOLETO.map(etapaNome => {
            const step = cardSteps.find(s => s.etapa === etapaNome);
            return {
              id: step?.id || crypto.randomUUID(),
              label: etapaNome,
              concluido: step?.status === 'Concluída'
            };
          });

          return {
            id: row.id,
            periodoId: 'periodo_boletos_atual',
            tipoProcesso: 'boleto',
            condominioId: row.condominio_id || '',
            condominioNome: condo?.nome || 'Condomínio',
            responsavelId: row.responsavel_id || 'user_fabricio',
            responsavelNome: resp?.nome || 'Fabrício',
            prazo: 'Dia 20',
            status: row.status || 'Pendente',
            checklist,
            informacoesAdicionais: '',
            comentarios: [],
            concluidoEm: row.data_conclusao ? new Date(row.data_conclusao).toLocaleDateString('pt-BR') : undefined
          };
        });

        StorageService.saveProcessoCards('boleto', cards);
        return cards;
      }

      return StorageService.getProcessoCards('boleto');
    } catch (err) {
      console.warn('[BoletoService] Fallback para cache local:', err);
      return StorageService.getProcessoCards('boleto');
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createBoleto(card: ProcessoCard): Promise<{ success: boolean; data?: ProcessoCard; error?: string }> {
    const supabase = getSupabaseClient();
    const id = (card.id && isUUID(card.id)) ? card.id : crypto.randomUUID();

    const cardObj: ProcessoCard = {
      ...card,
      id
    };

    if (!supabase) {
      StorageService.saveProcessoCard(cardObj);
      return { success: true, data: cardObj };
    }

    try {
      const validCondoId = isUUID(cardObj.condominioId) ? cardObj.condominioId : null;
      const validRespId = isUUID(cardObj.responsavelId) ? cardObj.responsavelId : null;

      const dbPayload = {
        id,
        condominio_id: validCondoId,
        responsavel_id: validRespId,
        criado_por: null,
        status: cardObj.status
      };

      const { error } = await supabase.from('boletos').insert(dbPayload);

      if (error) {
        console.error('[BoletoService] Erro no INSERT de boleto:', error.message);
        return { success: false, error: error.message };
      }

      // Create the 5 standard steps in boleto_steps
      const stepRows = ETAPAS_BOLETO.map(etapa => {
        const item = cardObj.checklist.find(c => c.label === etapa);
        return {
          id: (item?.id && isUUID(item.id)) ? item.id : crypto.randomUUID(),
          boleto_id: id,
          etapa,
          status: item?.concluido ? 'Concluída' : 'Pendente',
          observacoes: cardObj.informacoesAdicionais || null
        };
      });

      await supabase.from('boleto_steps').insert(stepRows);

      StorageService.saveProcessoCard(cardObj);
      return { success: true, data: cardObj };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * UPDATE real no Supabase
   */
  public static async updateBoleto(id: string, updates: Partial<ProcessoCard>): Promise<{ success: boolean; data?: ProcessoCard; error?: string }> {
    const supabase = getSupabaseClient();
    const current = StorageService.getProcessoCards('boleto').find(c => c.id === id);
    const updated = { ...(current || {}), ...updates, id } as ProcessoCard;
    StorageService.saveProcessoCard(updated);

    if (!supabase || !isUUID(id)) return { success: true, data: updated };

    try {
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.status !== undefined) {
        dbPayload.status = updates.status;
        dbPayload.data_conclusao = updates.status === 'Concluída' ? new Date().toISOString() : null;
      }
      if (updates.responsavelId !== undefined && isUUID(updates.responsavelId)) {
        dbPayload.responsavel_id = updates.responsavelId;
      }

      await supabase.from('boletos').update(dbPayload).eq('id', id);

      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message, data: updated };
    }
  }

  /**
   * Alternar etapa de boleto no Supabase
   */
  public static async toggleStep(boletoId: string, checkIdOrLabel: string): Promise<ProcessoCard | null> {
    const updated = StorageService.toggleProcessoChecklist('boleto', boletoId, checkIdOrLabel);
    const supabase = getSupabaseClient();

    if (supabase && isUUID(boletoId)) {
      try {
        const card = StorageService.getProcessoCards('boleto').find(c => c.id === boletoId);
        if (card) {
          const step = card.checklist.find(c => c.id === checkIdOrLabel || c.label === checkIdOrLabel);
          if (step) {
            await supabase
              .from('boleto_steps')
              .update({
                status: step.concluido ? 'Concluída' : 'Pendente',
                updated_at: new Date().toISOString()
              })
              .eq('boleto_id', boletoId)
              .eq('etapa', step.label);

            const allDone = card.checklist.every(c => c.concluido);
            await supabase
              .from('boletos')
              .update({
                status: allDone ? 'Concluída' : 'Em andamento',
                data_conclusao: allDone ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
              })
              .eq('id', boletoId);
          }
        }
      } catch (err) {
        console.warn('[BoletoService] Erro ao alternar etapa:', err);
      }
    }

    return updated || null;
  }

  /**
   * DELETE real no Supabase
   */
  public static async deleteBoleto(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    StorageService.deleteProcessoCard(id);

    if (!supabase || !isUUID(id)) return { success: true };

    try {
      await supabase.from('boleto_steps').delete().eq('boleto_id', id);
      const { error } = await supabase.from('boletos').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

