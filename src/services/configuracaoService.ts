import { getSupabaseClient } from '../lib/supabase';
import { StorageService } from './storageService';

export class ConfiguracaoService {
  /**
   * Get configuration by key from Supabase with fallback to LocalStorage
   */
  public static async getConfiguracao<T>(chave: string, fallback: T): Promise<T> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return fallback;
    }

    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('chave', chave)
        .single();

      if (error || !data) {
        return fallback;
      }

      try {
        return JSON.parse(data.valor);
      } catch {
        return (data.valor as unknown as T) || fallback;
      }
    } catch {
      return fallback;
    }
  }

  /**
   * Save configuration to Supabase and sync local state
   */
  public static async setConfiguracao(
    chave: string,
    valor: any,
    modulo: string = 'geral',
    descricao?: string
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    const strValor = typeof valor === 'string' ? valor : JSON.stringify(valor);

    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({
          chave,
          valor: strValor,
          modulo,
          descricao: descricao || chave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync all app configurations (Identidade, Xerox prices, etc.)
   */
  public static async loadAllConfiguracoes(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data } = await supabase.from('configuracoes').select('*');
      if (data && data.length > 0) {
        for (const item of data) {
          try {
            const parsed = JSON.parse(item.valor);
            if (item.chave === 'identidade') {
              StorageService.saveIdentidade(parsed);
            }
          } catch {}
        }
      }
    } catch {}
  }
}
