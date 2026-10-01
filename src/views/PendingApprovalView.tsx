import React from 'react';
import { Clock, Shield, LogOut, RefreshCw, CheckCircle2, User as UserIcon } from 'lucide-react';
import { User, IdentidadeConfig } from '../types';
import { StorageService } from '../services/storageService';

interface PendingApprovalViewProps {
  user: User;
  identidade: IdentidadeConfig;
  onRefreshStatus: () => void;
  onLogout: () => void;
  onSwitchToMaster: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  identidade,
  onRefreshStatus,
  onLogout,
  onSwitchToMaster
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070B18] text-slate-100 relative overflow-hidden select-none">
      {/* Background Gradient */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 shadow-xl mb-1">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white">{identidade.nomeSistema || 'PULSO95'}</h1>
          <p className="text-xs text-slate-400 font-medium">{identidade.subtitulo || 'Gestão inteligente de processos'}</p>
        </div>

        {/* Pending Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1326]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl space-y-6 text-center">
          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          {/* Exact text required by the prompt */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Cadastro realizado com sucesso.
            </h2>
            <p className="text-sm font-semibold text-amber-300">
              Seu acesso está aguardando aprovação do administrador.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
              Para garantir a segurança dos dados e condomínios, todas as novas contas devem ser liberadas manualmente pelo administrador Master (Fabrício).
            </p>
          </div>

          {/* User Details Box */}
          <div className="p-4 rounded-2xl bg-[#070B18] border border-[#1E293B] text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dados da sua solicitação
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Pendente</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nome:</span>
                <span className="font-bold text-white block">{user.nome}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">E-mail:</span>
                <span className="font-medium text-slate-300 block truncate">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cargo solicitado:</span>
                <span className="font-medium text-slate-300 block">{user.cargo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Data de cadastro:</span>
                <span className="font-mono text-slate-300 block">{user.criadoEm || 'Hoje'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onRefreshStatus}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verificar status de aprovação</span>
            </button>

            {/* Shortcut for testing the approval workflow */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                🧪 Teste rápido de aprovação (Simulação Master):
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Você pode entrar como <strong>Fabrício (Master)</strong> para aprovar esta conta em <em>Configurações → Usuários</em>.
              </p>
              <button
                type="button"
                onClick={onSwitchToMaster}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>👑 Entrar como Fabrício (Master) para Aprovar</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair / Entrar com outra conta</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          PULSO95 · Gestão Condominial
        </div>
      </div>
    </div>
  );
};
