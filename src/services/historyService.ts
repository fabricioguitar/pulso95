import { HistoricoItem } from '../types';

const STORAGE_KEY = 'pulso95_historico_auditoria';

export class HistoryService {
  public static getLogs(): HistoricoItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as HistoricoItem[];
    } catch {
      return [];
    }
  }

  public static addLog(entry: Omit<HistoricoItem, 'id' | 'dataHora'>): HistoricoItem {
    const list = this.getLogs();
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newItem: HistoricoItem = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dataHora
    };

    list.unshift(newItem);
    // Keep up to 200 logs
    if (list.length > 200) list.pop();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar log de histórico:', e);
    }

    return newItem;
  }

  public static saveLogs(logs: HistoricoItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Erro ao salvar histórico de logs:', e);
    }
  }

  public static addHistoryLog(item: HistoricoItem): void {
    const list = this.getLogs();
    list.unshift(item);
    if (list.length > 200) list.pop();
    this.saveLogs(list);
  }

  public static clearLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
