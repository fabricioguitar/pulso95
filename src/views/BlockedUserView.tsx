import React from 'react';
import { ShieldAlert, LogOut, Shield } from 'lucide-react';
import { User, IdentidadeConfig } from '../types';

interface BlockedUserViewProps {
  user: User;
  identidade: IdentidadeConfig;
  onLogout: () => void;
  onSwitchToMaster: () => void;
}

export const BlockedUserView: React.FC<BlockedUserViewProps> = ({
  user,
  identidade,
  onLogout,
  onSwitchToMaster
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070B18] text-slate-100 relative overflow-hidden select-none">
      <div className="w-full max-w-md z-10 space-y-6 text-center">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1326]/90 backdrop-blur-xl border border-rose-500/30 shadow-2xl space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Acesso Bloqueado</h2>
            <p className="text-xs text-rose-300">
              Sua conta foi suspensa temporariamente pelo administrador Master.
            </p>
            {user.motivoBloqueio && (
              <p className="text-xs text-slate-400 italic">
                Motivo: "{user.motivoBloqueio}"
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onSwitchToMaster}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 transition-colors"
            >
              👑 Alternar para Fabrício (Master) para desbloquear
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
