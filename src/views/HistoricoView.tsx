import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Activity,
  X
} from 'lucide-react';
import { HistoricoItem } from '../types';
import { HistoryService } from '../services/historyService';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface HistoricoViewProps {
  logs: HistoricoItem[];
  onClearLogs: () => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  logs,
  onClearLogs,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduloFilter, setModuloFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const logUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.usuarioNome) set.add(l.usuarioNome);
    });
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (moduloFilter && log.modulo !== moduloFilter) return false;
      if (userFilter && !log.usuarioNome.toLowerCase().includes(userFilter.toLowerCase())) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        if (
          !log.item.toLowerCase().includes(query) &&
          !log.acao.toLowerCase().includes(query) &&
          !log.usuarioNome.toLowerCase().includes(query) &&
          !log.modulo.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, moduloFilter, userFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar registros de auditoria..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={moduloFilter}
            onChange={e => setModuloFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos módulos</option>
            <option value="Tarefas">Tarefas</option>
            <option value="Condomínios">Condomínios</option>
            <option value="Balancetes">Balancetes</option>
            <option value="Boletos">Boletos</option>
            <option value="Xerox">Xerox</option>
            <option value="Assembleias">Assembleias</option>
            <option value="Identidade">Identidade</option>
            <option value="Usuários">Usuários</option>
          </select>

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos usuários</option>
            {logUsers.map(uName => (
              <option key={uName} value={uName}>
                {uName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsConfirmClearOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900 border border-rose-900/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar histórico</span>
        </button>
      </div>

      {/* Logs Table (Section 53) */}
      <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Item / Alvo</th>
                <th className="py-3 px-4">Valor Anterior</th>
                <th className="py-3 px-4">Novo Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum log registrado ainda. Realize ações no sistema para visualizar a trilha de auditoria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.dataHora}
                    </td>
                    <td className="py-3 px-4 font-bold text-white dark:text-white light:text-slate-900 whitespace-nowrap">
                      {log.usuarioNome}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {log.acao}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300 max-w-xs truncate">
                      {log.item}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.valorAnterior || '—'}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono text-[11px] max-w-xs truncate font-medium">
                      {log.valorNovo || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Clear */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          onClearLogs();
          onToast('info', 'Histórico de auditoria limpo.');
        }}
        title="Limpar Histórico de Auditoria"
        message="Deseja zerar os registros de atividades e auditoria do LocalStorage?"
      />
    </div>
  );
};
