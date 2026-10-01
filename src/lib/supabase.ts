import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local credential storage if not in env
const SUPABASE_LOCAL_STORAGE_KEYS = {
  URL: 'pulso95_supabase_url',
  ANON_KEY: 'pulso95_supabase_anon_key'
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'localStorage' | 'none';
}

/**
 * Retrieves the Supabase configuration prioritizing environment variables:
 * - VITE_SUPABASE_URL / SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY
 * Safe in both Vite (browser) and Node environments without throwing ReferenceErrors.
 */
export function getSupabaseConfig(): SupabaseConfig {
  let envUrl = '';
  let envAnonKey = '';

  // 1. Try Vite import.meta.env safely
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const env = (import.meta as any).env;
      envUrl = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim();
      envAnonKey = (
        env.VITE_SUPABASE_ANON_KEY ||
        env.SUPABASE_ANON_KEY ||
        env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        env.SUPABASE_PUBLISHABLE_KEY ||
        ''
      ).trim();
    }
  } catch {}

  // 2. Try Node/Process env safely
  try {
    if (!envUrl && typeof process !== 'undefined' && process.env) {
      envUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
    }
    if (!envAnonKey && typeof process !== 'undefined' && process.env) {
      envAnonKey = (
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        ''
      ).trim();
    }
  } catch {}

  if (envUrl && envAnonKey) {
    return {
      url: envUrl,
      anonKey: envAnonKey,
      source: 'env'
    };
  }

  // 3. Fallback to localStorage if configured via UI
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localUrl = localStorage.getItem(SUPABASE_LOCAL_STORAGE_KEYS.URL) || '';
      const localKey = localStorage.getItem(SUPABASE_LOCAL_STORAGE_KEYS.ANON_KEY) || '';

      if (localUrl.trim() && localKey.trim()) {
        return {
          url: localUrl.trim(),
          anonKey: localKey.trim(),
          source: 'localStorage'
        };
      }
    } catch {}
  }

  return {
    url: '',
    anonKey: '',
    source: 'none'
  };
}

/**
 * Returns a masked representation of sensitive keys for UI/Logs
 */
export function maskCredential(val: string): string {
  if (!val) return '';
  if (val.length <= 10) return '••••••••';
  return `${val.substring(0, 6)}••••••••${val.substring(val.length - 4)}`;
}

/**
 * Singleton client instance to avoid duplicate connections
 */
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the singleton instance of the Supabase client.
 * Creates only a single instance and reuses it on subsequent calls.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'pulso95_sb_auth_token'
      }
    });
    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase Client] Erro ao instanciar singleton:', err);
    return null;
  }
}

/**
 * Direct exported singleton instance for easy import:
 * import { supabase } from '@/lib/supabase';
 */
export const supabase: SupabaseClient | null = getSupabaseClient();

/**
 * Saves Supabase credentials locally for development/runtime testing
 */
export function saveSupabaseLocalConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!url || !anonKey) {
      localStorage.removeItem(SUPABASE_LOCAL_STORAGE_KEYS.URL);
      localStorage.removeItem(SUPABASE_LOCAL_STORAGE_KEYS.ANON_KEY);
    } else {
      localStorage.setItem(SUPABASE_LOCAL_STORAGE_KEYS.URL, url.trim());
      localStorage.setItem(SUPABASE_LOCAL_STORAGE_KEYS.ANON_KEY, anonKey.trim());
    }
  } catch {}
  // Reset client singleton so next call re-initializes
  supabaseInstance = null;
}

/**
 * Utility function to check if the required Supabase environment variables or credentials are present.
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export interface ConnectionTestResult {
  connected: boolean;
  status: 'connected' | 'unconfigured' | 'error';
  message: string;
  url?: string;
  source?: string;
  errorDetails?: string;
  latencyMs?: number;
  schemaStatus?: 'tables_ready' | 'tables_pending';
  schemaMessage?: string;
}

/**
 * Performs a REAL, non-fictional connection test to the Supabase project.
 * Differentiates between:
 * 1. Supabase Connection Established (Auth & REST API responding)
 * 2. Database Schema Status:
 *    - "Supabase conectado (banco configurado - tabelas ativas)"
 *    - "Supabase conectado, mas banco ainda não configurado"
 * 3. Supabase Não Conectado
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<ConnectionTestResult> {
  const urlToTest = customUrl?.trim() || getSupabaseConfig().url;
  const keyToTest = customKey?.trim() || getSupabaseConfig().anonKey;

  if (!urlToTest || !keyToTest) {
    const unconfiguredResult: ConnectionTestResult = {
      connected: false,
      status: 'unconfigured',
      message: 'Credenciais do Supabase não configuradas. Forneça a URL do projeto e a Chave Anon pública.'
    };
    return unconfiguredResult;
  }

  // Validate URL format
  try {
    const parsed = new URL(urlToTest);
    if (!parsed.protocol.startsWith('http')) {
      return {
        connected: false,
        status: 'error',
        message: 'A URL do Supabase deve iniciar com https:// ou http://.'
      };
    }
  } catch (_err) {
    return {
      connected: false,
      status: 'error',
      message: 'A URL informada não é válida (Exemplo: https://xyzcompany.supabase.co).'
    };
  }

  const startTime = Date.now();

  try {
    const testClient = createClient(urlToTest, keyToTest, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Probe 1: Ping Auth service
    const { error: authError } = await testClient.auth.getSession();
    const latency = Date.now() - startTime;

    if (authError && authError.status && authError.status >= 500) {
      const errDetails = JSON.stringify(authError);
      console.error('[Supabase Diagnóstico] Erro na autenticação:', authError);
      return {
        connected: false,
        status: 'error',
        url: maskCredential(urlToTest),
        message: `Falha na conexão com o Supabase: ${authError.message}`,
        errorDetails: errDetails,
        latencyMs: latency
      };
    }

    // Probe 2: Check Schema & Tables existence via Supabase SDK
    let schemaStatus: 'tables_ready' | 'tables_pending' = 'tables_pending';
    let schemaMessage = 'Supabase conectado, mas banco ainda não configurado (tabelas pendentes no SQL Editor).';

    try {
      const { error: tableError } = await testClient
        .from('profiles')
        .select('id')
        .limit(1);

      if (!tableError) {
        schemaStatus = 'tables_ready';
        schemaMessage = 'Supabase conectado e banco configurado! Tabelas ativas e operacionais.';
        console.log('[Supabase Diagnóstico] 🟢 Conexão com Supabase validada e tabelas presentes.');
      } else if (
        tableError.code === 'PGRST205' ||
        tableError.code === '42P01' ||
        tableError.message?.toLowerCase().includes('schema cache') ||
        tableError.message?.toLowerCase().includes('not find') ||
        tableError.message?.toLowerCase().includes('relation')
      ) {
        schemaStatus = 'tables_pending';
        schemaMessage = 'Supabase conectado, mas banco ainda não configurado (Execute o script SQL no SQL Editor do Supabase).';
        console.log('[Supabase Diagnóstico] 🟢 Supabase conectado, mas banco ainda não configurado.');
      } else if (
        tableError.code === 'PGRST301' ||
        tableError.message?.toLowerCase().includes('jwt') ||
        tableError.message?.toLowerCase().includes('unauthorized') ||
        tableError.message?.toLowerCase().includes('invalid api key')
      ) {
        console.error('[Supabase Diagnóstico] Chave do Supabase inválida:', tableError.message);
        return {
          connected: false,
          status: 'error',
          url: maskCredential(urlToTest),
          message: 'Chave do Supabase inválida ou sem permissão de acesso à API.',
          errorDetails: `${tableError.code || ''}: ${tableError.message}`,
          latencyMs: latency
        };
      } else {
        // Table exists but maybe empty or RLS protected
        schemaStatus = 'tables_ready';
        schemaMessage = `Supabase conectado e schema detectado (${tableError.message || 'Pronto'}).`;
      }
    } catch (e: any) {
      console.warn('[Supabase Diagnóstico] Aviso ao verificar tabelas:', e?.message);
    }

    return {
      connected: true,
      status: 'connected',
      url: maskCredential(urlToTest),
      message:
        schemaStatus === 'tables_ready'
          ? '🟢 Supabase conectado (banco configurado - tabelas ativas)'
          : '🟡 Supabase conectado, mas banco ainda não configurado',
      latencyMs: latency,
      schemaStatus,
      schemaMessage
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('[Supabase Diagnóstico] 🔴 Erro de conexão com Supabase:', error);
    return {
      connected: false,
      status: 'error',
      url: maskCredential(urlToTest),
      message: '🔴 Supabase não conectado: não foi possível alcançar o servidor. Verifique a URL e sua conexão.',
      errorDetails: String(error?.message || error),
      latencyMs: latency
    };
  }
}

export function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function ensureUUID(str?: string | null): string {
  if (str && isUUID(str)) return str;
  return crypto.randomUUID();
}
