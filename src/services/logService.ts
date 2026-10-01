import { getSupabaseClient } from '../lib/supabase';
import { HistoricoItem } from '../types';
import { StorageService } from './storageService';

export class LogService {
  /**
   * LEITURA: Supabase -> interface -> atualizar cache LocalStorage
   */
  public static async getLogs(): Promise<HistoricoItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return StorageService.getHistoryLogs();
    }

    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('[LogService] Erro ao carregar logs do Supabase:', error.message);
        return StorageService.getHistoryLogs();
      }

      if (data && data.length > 0) {
        const users = StorageService.getUsers();
        const logs: HistoricoItem[] = data.map(row => {
          const user = users.find(u => u.id === row.usuario_id);
          return {
            id: row.id,
            usuarioId: row.usuario_id || '',
            usuarioNome: user?.nome || 'Fabrício',
            dataHora: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '',
            modulo: (row.modulo as any) || 'Tarefas',
            acao: row.acao,
            item: row.registro_id || 'Registro'
          };
        });

        StorageService.saveHistoryLogs(logs);
        return logs;
      }

      return StorageService.getHistoryLogs();
    } catch {
      return StorageService.getHistoryLogs();
    }
  }

  /**
   * ESCRITA: INSERT real no Supabase
   */
  public static async createLog(
    usuarioNome: string,
    usuarioId: string,
    modulo: string,
    acao: string,
    registroId?: string
  ): Promise<void> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();

    const logItem: HistoricoItem = {
      id,
      usuarioId,
      usuarioNome,
      dataHora: new Date().toLocaleString('pt-BR'),
      modulo: modulo as any,
      acao,
      item: registroId || 'Registro'
    };

    StorageService.addHistoryLog(logItem);

    if (supabase) {
      try {
        await supabase.from('logs').insert({
          id,
          usuario_id: usuarioId && usuarioId.length > 20 ? usuarioId : null,
          modulo,
          registro_id: registroId || null,
          acao
        });
      } catch (e) {
        console.warn('Erro ao inserir log no Supabase:', e);
      }
    }
  }
}
