import { getSupabaseClient, isUUID, ensureUUID } from '../lib/supabase';
import { Tarefa, TaskChecklistItem, TaskComment } from '../types';
import { StorageService } from './storageService';

export class TarefaService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getTarefas(): Promise<Tarefa[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getTarefas();
    }

    try {
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .order('created_at', { ascending: false });

      if (tarefasError) {
        console.warn('[TarefaService] Erro ao buscar tarefas no Supabase:', tarefasError.message);
        return StorageService.getTarefas();
      }

      if (tarefasData && tarefasData.length > 0) {
        // Fetch checklists and messages in parallel for full synchronization
        const { data: checklistsData } = await supabase.from('task_checklists').select('*');
        const { data: messagesData } = await supabase.from('task_messages').select('*');
        const condominios = StorageService.getCondominios();
        const users = StorageService.getUsers();

        const tarefas: Tarefa[] = tarefasData.map(row => {
          const condo = condominios.find(c => c.id === row.condominio_id);
          const resp = users.find(u => u.id === row.responsavel_id);
          const criador = users.find(u => u.id === row.criado_por);

          const taskChecklist: TaskChecklistItem[] = (checklistsData || [])
            .filter(c => c.tarefa_id === row.id)
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
            .map(c => ({
              id: c.id,
              texto: c.descricao,
              concluido: Boolean(c.concluido),
              concluidoEm: c.concluido_em,
              concluidoPor: c.concluido_por
            }));

          const taskComments: TaskComment[] = (messagesData || [])
            .filter(m => m.tarefa_id === row.id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(m => {
              const autor = users.find(u => u.id === m.autor_id);
              return {
                id: m.id,
                autorId: m.autor_id || '',
                autorNome: autor?.nome || 'Colaborador',
                autorAvatar: autor?.avatar || '',
                texto: m.mensagem,
                dataHora: m.created_at ? new Date(m.created_at).toLocaleString('pt-BR') : ''
              };
            });

          return {
            id: row.id,
            titulo: row.titulo,
            condominioId: row.condominio_id || '',
            condominioNome: condo?.nome || 'Condomínio',
            tipo: row.tipo || 'Tarefa geral',
            prioridade: row.prioridade || 'Média',
            status: row.status || 'Pendente',
            responsavelId: row.responsavel_id || 'user_fabricio',
            responsavelNome: resp?.nome || 'Fabrício',
            prazo: row.prazo || '',
            valorCalculado: Number(row.valor) || 0,
            informacoesAdicionais: '',
            anexos: [],
            checklist: taskChecklist,
            comentarios: taskComments,
            criadoEm: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '',
            criadoPor: criador?.nome || 'Fabrício',
            concluidoEm: row.data_conclusao ? new Date(row.data_conclusao).toLocaleDateString('pt-BR') : undefined
          };
        });

        // Atualiza cache local
        StorageService.saveTarefas(tarefas);
        return tarefas;
      }

      return StorageService.getTarefas();
    } catch (err) {
      console.warn('[TarefaService] Fallback para cache local:', err);
      return StorageService.getTarefas();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createTarefa(tarefa: Tarefa): Promise<{ success: boolean; data?: Tarefa; error?: string }> {
    const supabase = getSupabaseClient();
    const id = (tarefa.id && isUUID(tarefa.id)) ? tarefa.id : crypto.randomUUID();

    const tarefaObj: Tarefa = {
      ...tarefa,
      id
    };

    if (!supabase) {
      StorageService.saveTarefa(tarefaObj);
      return { success: true, data: tarefaObj };
    }

    try {
      const validCondoId = isUUID(tarefaObj.condominioId) ? tarefaObj.condominioId : null;
      const validRespId = isUUID(tarefaObj.responsavelId) ? tarefaObj.responsavelId : null;

    const dbPayload = {
      id,
      titulo: tarefaObj.titulo,
      tipo: tarefaObj.tipo,
      prioridade: tarefaObj.prioridade
        ? tarefaObj.prioridade
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
        : 'media',
      status: tarefaObj.status
        ? tarefaObj.status
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, '_')
        : 'pendente',
      prazo: tarefaObj.prazo || null,
      valor: tarefaObj.valorCalculado || 0,
      condominio_id: validCondoId,
      responsavel_id: validRespId,
      criado_por: null
    };

      const { data, error } = await supabase.from('tarefas').insert(dbPayload).select().single();

      if (error) {
        console.error('[TarefaService] Erro no INSERT de tarefa no Supabase:', error.message);
        // Supabase falhou: não grava no LocalStorage
        return { success: false, error: error.message };
      }

      // If there are checklists, insert into task_checklists
      if (tarefaObj.checklist && tarefaObj.checklist.length > 0) {
        const chkRows = tarefaObj.checklist.map((c, i) => ({
          id: (c.id && isUUID(c.id)) ? c.id : crypto.randomUUID(),
          tarefa_id: id,
          descricao: c.texto,
          concluido: Boolean(c.concluido),
          ordem: i
        }));
        await supabase.from('task_checklists').insert(chkRows);
      }

      // Sucesso confirmado -> salva no cache
      StorageService.saveTarefa(tarefaObj);
      return { success: true, data: tarefaObj };
    } catch (err: any) {
      console.error('[TarefaService] Exceção no INSERT Supabase:', err);
      return { success: false, error: err.message || 'Erro inesperado ao salvar no Supabase' };
    }
  }

  /**
   * UPDATE real no Supabase
   */
  public static async updateTarefa(id: string, updates: Partial<Tarefa>): Promise<{ success: boolean; data?: Tarefa; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase || !isUUID(id)) {
      const current = StorageService.getTarefaById(id);
      const updated = { ...(current || {}), ...updates, id } as Tarefa;
      StorageService.saveTarefa(updated);
      return { success: true, data: updated };
    }

    try {
      const dbPayload: Record<string, any> = {};

      if (updates.titulo !== undefined) dbPayload.titulo = updates.titulo;
      if (updates.tipo !== undefined) dbPayload.tipo = updates.tipo;
      if (updates.prioridade !== undefined) dbPayload.prioridade = updates.prioridade;
      if (updates.status !== undefined) {
        dbPayload.status = updates.status;
      }
      if (updates.prazo !== undefined) dbPayload.prazo = updates.prazo;
      if (updates.valorCalculado !== undefined) dbPayload.valor = updates.valorCalculado;
      if (updates.condominioId !== undefined && isUUID(updates.condominioId)) {
        dbPayload.condominio_id = updates.condominioId;
      }
      if (updates.responsavelId !== undefined && isUUID(updates.responsavelId)) {
        dbPayload.responsavel_id = updates.responsavelId;
      }

      const { error } = await supabase
        .from('tarefas')
        .update(dbPayload)
        .eq('id', id);

      if (error) {
        console.error('[TarefaService] Erro no UPDATE de tarefa no Supabase:', error.message);
        return { success: false, error: error.message };
      }

      const current = StorageService.getTarefaById(id);
      const updated = { ...(current || {}), ...updates, id } as Tarefa;
      StorageService.saveTarefa(updated);

      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Alternar conclusão de tarefa no Supabase
   */
  public static async toggleConcluirTarefa(id: string): Promise<Tarefa | null> {
    const supabase = getSupabaseClient();

    if (supabase && isUUID(id)) {
      const current = StorageService.getTarefaById(id);
      const newStatus = current?.status === 'Concluída' ? 'Pendente' : 'Concluída';
      try {
        const { error } = await supabase
          .from('tarefas')
          .update({
            status: newStatus,
            data_conclusao: newStatus === 'Concluída' ? new Date().toISOString() : null
          })
          .eq('id', id);

        if (error) {
          console.error('[TarefaService] Erro ao alternar status da tarefa:', error.message);
          return null;
        }
      } catch (err) {
        console.warn('[TarefaService] Erro ao alternar status da tarefa:', err);
        return null;
      }
    }

    const updated = StorageService.toggleConcluirTarefa(id);
    return updated || null;
  }

  /**
   * DELETE real no Supabase
   */
  public static async deleteTarefa(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase || !isUUID(id)) {
      StorageService.deleteTarefa(id);
      return { success: true };
    }

    try {
      // First delete associated checklists and messages
      await supabase.from('task_checklists').delete().eq('tarefa_id', id);
      await supabase.from('task_messages').delete().eq('tarefa_id', id);

      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[TarefaService] Erro no DELETE de tarefa no Supabase:', error.message);
        return { success: false, error: error.message };
      }

      StorageService.deleteTarefa(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Checklist: Add item
   */
  public static async addChecklistItem(tarefaId: string, texto: string): Promise<TaskChecklistItem> {
    const supabase = getSupabaseClient();
    const item: TaskChecklistItem = {
      id: crypto.randomUUID(),
      texto,
      concluido: false
    };

    const task = StorageService.getTarefaById(tarefaId);
    if (task) {
      const checklist = [...(task.checklist || []), item];
      StorageService.saveTarefa({ ...task, checklist });
    }

    if (supabase && isUUID(tarefaId)) {
      try {
        await supabase.from('task_checklists').insert({
          id: item.id,
          tarefa_id: tarefaId,
          descricao: texto,
          concluido: false,
          ordem: (task?.checklist?.length || 0)
        });
      } catch (e) {
        console.warn('Erro ao inserir checklist no Supabase:', e);
      }
    }

    return item;
  }

  /**
   * Checklist: Toggle item completion
   */
  public static async toggleChecklistItem(tarefaId: string, itemId: string, concluido: boolean, usuarioNome = 'Fabrício'): Promise<boolean> {
    const supabase = getSupabaseClient();
    const task = StorageService.getTarefaById(tarefaId);
    if (task && task.checklist) {
      const checklist = task.checklist.map((c: TaskChecklistItem) => {
        if (c.id === itemId) {
          return {
            ...c,
            concluido,
            concluidoEm: concluido ? new Date().toLocaleDateString('pt-BR') : undefined,
            concluidoPor: concluido ? usuarioNome : undefined
          };
        }
        return c;
      });
      StorageService.saveTarefa({ ...task, checklist });
    }

    if (supabase && isUUID(itemId)) {
      try {
        await supabase.from('task_checklists').update({
          concluido,
          concluido_em: concluido ? new Date().toISOString() : null
        }).eq('id', itemId);
      } catch (e) {
        console.warn('Erro ao atualizar checklist no Supabase:', e);
      }
    }

    return true;
  }

  /**
   * Task Message: Add message
   */
  public static async addMessage(tarefaId: string, texto: string, autor: { id: string; nome: string; avatar?: string }): Promise<TaskComment> {
    const supabase = getSupabaseClient();
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      autorId: autor.id,
      autorNome: autor.nome,
      autorAvatar: autor.avatar,
      texto,
      dataHora: new Date().toLocaleString('pt-BR')
    };

    const task = StorageService.getTarefaById(tarefaId);
    if (task) {
      const comentarios = [...(task.comentarios || []), comment];
      StorageService.saveTarefa({ ...task, comentarios });
    }

    if (supabase && isUUID(tarefaId)) {
      try {
        await supabase.from('task_messages').insert({
          id: comment.id,
          tarefa_id: tarefaId,
          autor_id: isUUID(autor.id) ? autor.id : null,
          mensagem: texto
        });
      } catch (e) {
        console.warn('Erro ao enviar mensagem da tarefa no Supabase:', e);
      }
    }

    return comment;
  }
}

