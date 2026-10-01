import { getSupabaseClient } from '../../lib/supabase';
import { Tarefa, TaskPriority, TaskStatus, TaskType, GravidadeMulta } from '../../types';

export class SupabaseTarefasService {
  /**
   * Fetch all tasks with their checklists and comments
   */
  public static async getTarefas(): Promise<Tarefa[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('criada_em', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar tarefas do Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      titulo: row.titulo,
      condominioId: row.condominio_id,
      condominioNome: row.condominio_nome,
      tipo: row.tipo as TaskType,
      gravidade: row.gravidade_multa as GravidadeMulta,
      valorCalculado: Number(row.valor_multa || row.valor_espaco || 0),
      responsavelId: row.responsavel_id,
      responsavelNome: row.responsavel_nome,
      prazo: row.data_prazo || row.prazo || '',
      prioridade: row.prioridade as TaskPriority,
      status: row.status as TaskStatus,
      informacoesAdicionais: row.descricao || row.informacoes_adicionais || '',
      anexos: row.anexos || [],
      checklist: row.checklist || [],
      comentarios: row.comentarios || [],
      criadoEm: row.criada_em || row.criado_em || '',
      criadoPor: row.criada_por || row.criado_por || 'Fabrício',
      concluidoEm: row.concluida_em || row.concluido_em,
      concluidoPor: row.concluida_por || row.concluido_por
    }));
  }

  /**
   * Create or update a task
   */
  public static async saveTarefa(tarefa: Tarefa): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.informacoesAdicionais,
      informacoes_adicionais: tarefa.informacoesAdicionais,
      tipo: tarefa.tipo,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      condominio_id: tarefa.condominioId,
      condominio_nome: tarefa.condominioNome,
      responsavel_id: tarefa.responsavelId,
      responsavel_nome: tarefa.responsavelNome,
      data_prazo: tarefa.prazo,
      prazo: tarefa.prazo,
      criada_em: tarefa.criadoEm,
      criada_por: tarefa.criadoPor,
      concluida_em: tarefa.concluidoEm,
      concluida_por: tarefa.concluidoPor,
      gravidade_multa: tarefa.gravidade,
      valor_multa: tarefa.valorCalculado,
      anexos: tarefa.anexos,
      checklist: tarefa.checklist,
      comentarios: tarefa.comentarios
    };

    const { error } = await supabase
      .from('tarefas')
      .upsert(payload);

    return !error;
  }

  /**
   * Delete task
   */
  public static async deleteTarefa(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);

    return !error;
  }
}
