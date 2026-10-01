import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  UploadCloud,
  Code2,
  ShieldCheck,
  Zap,
  Info,
  Download
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseLocalConfig,
  testSupabaseConnection,
  ConnectionTestResult
} from '../../lib/supabase';
import { FULL_SUPABASE_SCHEMA_SQL } from '../../lib/supabaseSchemaSql';
import { SupabaseMigrationService, MigrationProgress } from '../../services/supabaseMigration';

interface SupabaseIntegrationCardProps {
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const SupabaseIntegrationCard: React.FC<SupabaseIntegrationCardProps> = ({ onToast }) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');

  // Initial connection test on load if configured
  useEffect(() => {
    if (config.url && config.anonKey) {
      handleTest(config.url, config.anonKey);
    }
  }, []);

  const handleTest = async (testUrl?: string, testKey?: string) => {
    setIsTesting(true);
    const targetUrl = testUrl !== undefined ? testUrl : urlInput;
    const targetKey = testKey !== undefined ? testKey : keyInput;

    try {
      const result = await testSupabaseConnection(targetUrl, targetKey);
      setTestResult(result);
      if (result.connected) {
        if (result.schemaStatus === 'tables_ready') {
          onToast(
            'success',
            '🟢 Supabase conectado',
            `Comunicação validada (${result.latencyMs}ms). Banco configurado e tabelas ativas!`
          );
        } else {
          onToast(
            'info',
            '🟡 Supabase conectado, mas banco ainda não configurado',
            `Comunicação com o projeto OK (${result.latencyMs}ms). Execute o SQL do banco para criar as tabelas.`
          );
        }
      } else if (result.status === 'unconfigured') {
        onToast('info', 'Supabase não configurado', 'Informe a URL do projeto e a Chave Anon.');
      } else {
        onToast('warning', '🔴 Supabase não conectado', result.message);
      }
    } catch (err: any) {
      console.error('[Supabase Diagnóstico] Erro ao testar:', err);
      setTestResult({
        connected: false,
        status: 'error',
        message: '🔴 Supabase não conectado: ' + (err?.message || 'Erro inesperado ao testar conexão.')
      });
      onToast('warning', '🔴 Supabase não conectado', err?.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      onToast('warning', 'Campos incompletos', 'Informe a URL do projeto e a Chave Anon.');
      return;
    }

    saveSupabaseLocalConfig(urlInput.trim(), keyInput.trim());
    const fresh = getSupabaseConfig();
    setConfig(fresh);
    onToast('success', 'Credenciais salvas com sucesso!');
    handleTest(urlInput.trim(), keyInput.trim());
  };

  const handleDisconnect = () => {
    saveSupabaseLocalConfig('', '');
    setUrlInput('');
    setKeyInput('');
    setConfig(getSupabaseConfig());
    setTestResult(null);
    onToast('info', 'Supabase desconectado', 'O sistema continuará operando via armazenamento local.');
  };

  const handleMigrate = async () => {
    if (!testResult?.connected) {
      onToast('warning', 'Conexão necessária', 'Conecte e valide o Supabase antes de sincronizar os dados.');
      return;
    }

    if (testResult.schemaStatus === 'tables_pending') {
      onToast(
        'warning',
        'Banco ainda não configurado',
        'Execute primeiro o script SQL no Supabase para criar as tabelas antes de migrar os dados.'
      );
      setShowSqlModal(true);
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('Iniciando sincronização...');

    const res = await SupabaseMigrationService.migrateAllLocalData((p: MigrationProgress) => {
      setMigrationStatus(`${p.step}: ${p.message}`);
    });

    setIsMigrating(false);
    if (res.success) {
      onToast('success', 'Migração Concluída!', res.message);
    } else {
      onToast('warning', 'Atenção na Migração', res.message);
    }
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(FULL_SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
      onToast('success', 'SQL do banco gerado e copiado!', 'Cole no SQL Editor do seu projeto Supabase.');
    } catch {
      setShowSqlModal(true);
      onToast('info', 'SQL do banco gerado', 'Visualize e copie o código na janela.');
    }
  };

  const handleDownloadSql = () => {
    try {
      const blob = new Blob([FULL_SUPABASE_SCHEMA_SQL], { type: 'text/sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pulso95_supabase_schema.sql';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast('success', 'Arquivo SQL baixado com sucesso!');
    } catch {
      handleCopySql();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Supabase</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PULSO95 Backend Real
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conexão com PostgreSQL, Autenticação, Row-Level Security e persistência na nuvem
            </p>
          </div>
        </div>

        {/* Real Status Badge */}
        <div className="flex items-center gap-2">
          {isTesting ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Testando conexão...</span>
            </span>
          ) : testResult?.connected ? (
            testResult.schemaStatus === 'tables_ready' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Supabase conectado</span>
                <span className="text-[10px] opacity-75 font-normal">({testResult.latencyMs}ms)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>🟡 Supabase conectado, mas banco ainda não configurado</span>
              </span>
            )
          ) : testResult?.status === 'error' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>🔴 Supabase não conectado</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Status da conexão: Não verificado</span>
            </span>
          )}
        </div>
      </div>

      {/* Diagnostics / Status Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed ${
            testResult.connected
              ? testResult.schemaStatus === 'tables_ready'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testResult.connected ? (
              testResult.schemaStatus === 'tables_ready' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {testResult.connected
                    ? testResult.schemaStatus === 'tables_ready'
                      ? '🟢 Comunicação com Supabase Validada'
                      : '🟡 Conexão Estabelecida com Sucesso'
                    : '🔴 Diagnóstico de Conexão'}
                </span>
                {testResult.connected && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-700">
                    Latência: {testResult.latencyMs}ms
                  </span>
                )}
              </div>

              <p className="text-slate-300">{testResult.message}</p>

              {/* Differentiate Connection vs Schema */}
              {testResult.connected && testResult.schemaStatus && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Status do Banco de Dados:</span>
                    {testResult.schemaStatus === 'tables_ready' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🟢 Tabelas criadas e ativas no PostgreSQL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🟡 Banco ainda não configurado (Schema SQL pendente)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {testResult.schemaMessage}
                  </p>
                </div>
              )}

              {testResult.errorDetails && (
                <div className="font-mono text-[11px] p-2 rounded bg-black/40 text-slate-300 overflow-x-auto mt-2">
                  {testResult.errorDetails}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schema Instructions Banner if tables are pending */}
      {testResult?.connected && testResult.schemaStatus === 'tables_pending' && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Info className="w-4 h-4" />
            <span>Como Configurar a Estrutura do Banco no Supabase (Etapa Única):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <li>Abra o painel do seu projeto no Supabase (<strong>PULSO95</strong>).</li>
            <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong>.</li>
            <li>Clique no botão <strong>"Gerar SQL do banco"</strong> abaixo e cole no SQL Editor do Supabase.</li>
            <li>Clique em <strong>Run</strong> (Executar) no Supabase.</li>
            <li>Volte aqui e clique em <strong>"Testar conexão"</strong> para confirmar que as tabelas estão prontas!</li>
          </ol>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copiado com Sucesso!' : 'Gerar e Copiar SQL do Banco'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-white bg-amber-950/40 border border-amber-800/50"
            >
              Visualizar SQL Completo
            </button>
          </div>
        </div>
      )}

      {/* Credentials Configuration */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            URL do Projeto Supabase (Project URL)
          </label>
          <input
            type="url"
            placeholder="https://sua-empresa.supabase.co"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Carregada automaticamente de <code>SUPABASE_URL</code> ou <code>VITE_SUPABASE_URL</code> configurados nos Secrets do ambiente.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Chave Pública Anon / Publishable Key
          </label>
          <input
            type="password"
            placeholder="Chave pública anônima do Supabase..."
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Utiliza com segurança a chave pública (<strong>anon</strong> / <strong>publishable</strong>). O segredo <strong>service_role</strong> nunca é utilizado no frontend.</span>
          </div>
        </div>

        {/* Action Buttons: Testar Conexão + Gerar SQL do Banco */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Main requested button 1: Testar conexão */}
          <button
            type="button"
            disabled={isTesting}
            onClick={() => handleTest()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 flex items-center gap-2 shadow-md shadow-blue-600/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testando conexão...' : 'Testar conexão'}</span>
          </button>

          {/* Main requested button 2: Gerar SQL do banco */}
          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'SQL do banco copiado!' : 'Gerar SQL do banco'}</span>
          </button>

          {/* View SQL in Modal */}
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Visualizar SQL</span>
          </button>

          {/* Save / Disconnect */}
          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Salvar Credenciais
          </button>

          {config.url && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/40 transition-colors ml-auto"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>

      {/* Migration / Next Step Information */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Próxima Etapa: Migração de Dados</h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {testResult?.connected
              ? testResult.schemaStatus === 'tables_ready'
                ? 'Pronto para Migração'
                : 'Aguardando Execução do SQL'
              : 'Conexão Pendente'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          O PULSO95 continua operando 100% com o LocalStorage preservado. Quando você executar o script SQL no Supabase,
          o botão abaixo será habilitado para transferir os dados com segurança sem apagar nenhuma informação local:
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={!testResult?.connected || testResult.schemaStatus !== 'tables_ready' || isMigrating}
            onClick={handleMigrate}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isMigrating ? 'animate-bounce' : ''}`} />
            <span>{isMigrating ? 'Sincronizando com Supabase...' : 'Migrar Dados do LocalStorage para o Supabase'}</span>
          </button>

          {migrationStatus && (
            <span className="text-xs font-medium text-slate-300 animate-pulse">
              {migrationStatus}
            </span>
          )}
        </div>
      </div>

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#0D1326] border border-[#1E293B] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Script SQL do Banco (PULSO95)</h3>
                  <span className="text-xs text-slate-400">Copie e execute no SQL Editor do seu projeto Supabase</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-300 flex-1 font-mono bg-[#070B18]">
              <p className="text-slate-400 font-sans text-xs">
                Este script cria todas as 12 tabelas normalizadas do PULSO95 (usuarios, condominios, tarefas, balancete_periodos,
                balancete_cards, boleto_periodos, boleto_cards, xerox_registros, assembleias, mensagens_chat, notificacoes,
                historico_logs), ativa o Row Level Security (RLS) e cadastra Fabrício como o único Master inicial:
              </p>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-emerald-300 max-h-96">
                {FULL_SUPABASE_SCHEMA_SQL}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copiado com Sucesso!' : 'Copiar SQL Completo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .sql</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
