import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  PieChart,
  Receipt,
  ArrowRight,
  TrendingUp,
  User as UserIcon,
  MessageSquare,
  FileCheck,
  Building
} from 'lucide-react';
import {
  Tarefa,
  PeriodoProcesso,
  ProcessoCard,
  Assembleia,
  User,
  HistoricoItem
} from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { ActiveTab } from '../components/layout/Sidebar';
import { UserAvatar } from '../components/common/UserAvatar';

interface DashboardViewProps {
  currentUser: User;
  users: User[];
  tarefas: Tarefa[];
  balanceteCards: ProcessoCard[];
  boletoCards: ProcessoCard[];
  assembleias: Assembleia[];
  historyLogs: HistoricoItem[];
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTaskModal: () => void;
  onOpenTaskDetail: (task: Tarefa) => void;
  onFilterTasksByAssignee: (assigneeName: string) => void;
  onSwitchUser: (userId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  users,
  tarefas,
  balanceteCards,
  boletoCards,
  assembleias,
  historyLogs,
  onSelectTab,
  onOpenTaskModal,
  onOpenTaskDetail,
  onFilterTasksByAssignee,
  onSwitchUser
}) => {
  // Counts (Section 10)
  const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente' || t.status === 'Em andamento').length;
  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada').length;
  const tarefasConcluidas = tarefas.filter(t => t.status === 'Concluída').length;

  const balancetesEmAndamento = balanceteCards.filter(c => c.status !== 'Concluída').length;
  const balancetesConcluidos = balanceteCards.filter(c => c.status === 'Concluída').length;

  const boletosEmAndamento = boletoCards.filter(c => c.status !== 'Concluída').length;
  const boletosConcluidos = boletoCards.filter(c => c.status === 'Concluída').length;

  // Tarefas de hoje / prioritárias
  const tarefasHoje = tarefas
    .filter(t => t.status !== 'Concluída')
    .sort((a, b) => {
      if (a.prioridade === 'Urgente') return -1;
      if (b.prioridade === 'Urgente') return 1;
      return a.prazo.localeCompare(b.prazo);
    })
    .slice(0, 5);

  const getCollabStats = (nome: string) => {
    const userTasks = tarefas.filter(t => t.responsavelNome.toLowerCase() === nome.toLowerCase());
    return {
      total: userTasks.length,
      pendentes: userTasks.filter(t => t.status !== 'Concluída' && t.status !== 'Atrasada').length,
      atrasadas: userTasks.filter(t => t.status === 'Atrasada').length,
      concluidas: userTasks.filter(t => t.status === 'Concluída').length
    };
  };

  const fabricioStats = getCollabStats('Fabrício');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-[#1E293B] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #070B18 0%, #111A3A 50%, #312E81 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UserAvatar name={currentUser.nome} avatarUrl={currentUser.avatar} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                  {currentUser.cargo}
                </span>
                <span className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Bem-vindo ao PULSO95, {currentUser.nome}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl">
                Gestão integrada de condomínios, tarefas, balancetes, boletos e xerox da equipe PULSO95.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTaskModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all whitespace-nowrap"
            >
              + Nova Tarefa
            </button>
            <button
              onClick={() => onSelectTab('balancetes')}
              className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 active:scale-95 transition-all whitespace-nowrap"
            >
              Ver Balancetes
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onSelectTab('tarefas')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Tarefas pendentes</span>
          <span className="text-2xl font-bold text-blue-400 mt-1 block font-mono tabular-nums">
            {tarefasPendentes}
          </span>
          <span className="text-[10px] text-slate-500">Na fila de execução</span>
        </div>

        <div
          onClick={() => onSelectTab('tarefas')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-rose-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Tarefas atrasadas</span>
          <span className="text-2xl font-bold text-rose-400 mt-1 block font-mono tabular-nums">
            {tarefasAtrasadas}
          </span>
          <span className="text-[10px] text-rose-400/80">Requerem urgência</span>
        </div>

        <div
          onClick={() => onSelectTab('tarefas')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Tarefas concluídas</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono tabular-nums">
            {tarefasConcluidas}
          </span>
          <span className="text-[10px] text-emerald-500/80">Finalizadas com sucesso</span>
        </div>

        <div
          onClick={() => onSelectTab('balancetes')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-indigo-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Balancetes em andamento</span>
          <span className="text-2xl font-bold text-indigo-400 mt-1 block font-mono tabular-nums">
            {balancetesEmAndamento}
          </span>
          <span className="text-[10px] text-indigo-400/80">Checklists abertos</span>
        </div>

        <div
          onClick={() => onSelectTab('balancetes')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Balancetes concluídos</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono tabular-nums">
            {balancetesConcluidos}
          </span>
          <span className="text-[10px] text-emerald-500/80">100% finalizados</span>
        </div>

        <div
          onClick={() => onSelectTab('boletos')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-400 block">Boletos em andamento</span>
          <span className="text-2xl font-bold text-purple-400 mt-1 block font-mono tabular-nums">
            {boletosEmAndamento}
          </span>
          <span className="text-[10px] text-purple-400/80">Em processamento</span>
        </div>

        <div
          onClick={() => onSelectTab('boletos')}
          className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer col-span-2 sm:col-span-1"
        >
          <span className="text-[11px] text-slate-400 block">Boletos concluídos</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono tabular-nums">
            {boletosConcluidos}
          </span>
          <span className="text-[10px] text-emerald-500/80">Emitidos e enviados</span>
        </div>
      </div>

      {/* Main Grid: Tarefas de Hoje & Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section: Tarefas de hoje (Section 10) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <span>Tarefas de hoje & prioritárias</span>
                <span className="text-xs font-normal text-slate-400">({tarefasHoje.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Demandas operacionais em destaque</p>
            </div>
            <button
              onClick={() => onSelectTab('tarefas')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 dark:divide-slate-800/80 light:divide-slate-100 mt-2">
            {tarefasHoje.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma tarefa pendente no momento.
              </div>
            ) : (
              tarefasHoje.map(task => (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskDetail(task)}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-400">
                        {task.condominioNome}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <PriorityBadge prioridade={task.prioridade as any} />
                      <StatusBadge status={task.status as any} size="sm" />
                    </div>
                    <h3 className="text-xs font-medium text-slate-200 dark:text-slate-200 light:text-slate-800 group-hover:text-blue-400 transition-colors truncate">
                      {task.titulo}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Prazo: {task.prazo.split('-').reverse().join('/')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 block">
                      {task.responsavelNome}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Atividades Recentes (Section 10) */}
        <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
              <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
                Atividades recentes
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Auditoria LocalStorage</span>
            </div>

            <div className="space-y-3 mt-3 max-h-80 overflow-y-auto pr-1">
              {historyLogs.slice(0, 6).map(act => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 dark:text-slate-200 light:text-slate-800 leading-snug">
                      <strong className="text-white dark:text-white light:text-slate-900 font-semibold">
                        {act.usuarioNome}
                      </strong>{' '}
                      {act.acao}: <span className="text-slate-300 font-medium">{act.item}</span>
                    </p>
                    {act.valorNovo && (
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {act.valorNovo}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {act.dataHora.split(' ')[1] || act.dataHora}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 text-center">
            <button
              onClick={() => onSelectTab('historico')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Ver histórico completo de ações →
            </button>
          </div>
        </div>
      </div>

      {/* Collaborators Overview Cards */}
      <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Equipe & Distribuição de Tarefas</h2>
          <span className="text-xs text-slate-400">
            {users.filter(u => u.status === 'ativo').length} colaborador(es) ativo(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.status === 'ativo').map(u => {
            const stats = getCollabStats(u.nome);
            const isUserMaster = u.role === 'master';

            return (
              <div key={u.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={u.nome} avatarUrl={u.avatar} size="sm" />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{u.nome}</span>
                        {isUserMaster && (
                          <span className="text-[10px] text-amber-400 font-normal">👑</span>
                        )}
                      </h3>
                      <span className={`text-[10px] ${isUserMaster ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                        {u.cargo}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{stats.total} demandas</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pendentes</span>
                    <span className="font-bold text-blue-400 font-mono">{stats.pendentes}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Atrasadas</span>
                    <span className="font-bold text-rose-400 font-mono">{stats.atrasadas}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Concluídas</span>
                    <span className="font-bold text-emerald-400 font-mono">{stats.concluidas}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      onFilterTasksByAssignee(u.nome);
                      onSelectTab('tarefas');
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Ver tarefas
                  </button>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => onSwitchUser(u.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-600/10 rounded-lg transition-colors"
                    >
                      Alternar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
