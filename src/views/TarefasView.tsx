import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Paperclip,
  MessageSquare,
  DollarSign,
  Edit,
  Eye,
  Trash2,
  Building2,
  X,
  List,
  LayoutGrid
} from 'lucide-react';
import { Tarefa, Condominio, User as UserType, TaskPriority, TaskType, TaskStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ExcelService } from '../services/excelService';

interface TarefasViewProps {
  tarefas: Tarefa[];
  condominios: Condominio[];
  users: UserType[];
  currentUser: UserType;
  onOpenNewTaskModal: () => void;
  onOpenTaskDetail: (task: Tarefa) => void;
  onEditTask: (task: Tarefa) => void;
  onDeleteTask: (id: string) => void;
  onToggleConcluir: (id: string) => void;
  initialFilterAssignee?: string;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({
  tarefas,
  condominios,
  users,
  currentUser,
  onOpenNewTaskModal,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
  onToggleConcluir,
  initialFilterAssignee,
  onToast
}) => {
  const [viewMode, setViewMode] = useState<'tabela' | 'cards'>('tabela');
  const [searchTerm, setSearchTerm] = useState('');
  const [condoFilter, setCondoFilter] = useState('');
  const [respFilter, setRespFilter] = useState(initialFilterAssignee || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Filtered Tarefas
  const filteredTarefas = useMemo(() => {
    return tarefas.filter(task => {
      if (condoFilter && task.condominioId !== condoFilter) return false;
      if (respFilter) {
        if (respFilter === 'Não cadastrado' && task.responsavelNome !== 'Não cadastrado') return false;
        if (respFilter !== 'Não cadastrado' && task.responsavelNome.toLowerCase() !== respFilter.toLowerCase()) return false;
      }
      if (statusFilter && task.status !== statusFilter) return false;
      if (prioridadeFilter && task.prioridade !== prioridadeFilter) return false;
      if (tipoFilter && task.tipo !== tipoFilter) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const mTitle = task.titulo.toLowerCase().includes(query);
        const mCondo = task.condominioNome.toLowerCase().includes(query);
        const mResp = task.responsavelNome.toLowerCase().includes(query);
        const mInfo = task.informacoesAdicionais?.toLowerCase().includes(query);
        if (!mTitle && !mCondo && !mResp && !mInfo) return false;
      }

      return true;
    });
  }, [tarefas, condoFilter, respFilter, statusFilter, prioridadeFilter, tipoFilter, searchTerm]);

  // Excel Export (Section 26)
  const handleExportExcel = () => {
    try {
      ExcelService.exportTarefasToExcel(filteredTarefas);
      onToast('success', 'Excel exportado com sucesso.', `${filteredTarefas.length} tarefas exportadas para PULSO95_Tarefas.xlsx`);
    } catch (e) {
      console.error(e);
      onToast('warning', 'Erro ao exportar Excel');
    }
  };

  const clearFilters = () => {
    setCondoFilter('');
    setRespFilter('');
    setStatusFilter('');
    setPrioridadeFilter('');
    setTipoFilter('');
    setSearchTerm('');
  };

  const hasFilters = condoFilter || respFilter || statusFilter || prioridadeFilter || tipoFilter || searchTerm;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por tarefa, condomínio ou responsável..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons: Exportar Excel & Nova Tarefa */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#111827] border border-[#1E293B]">
            <button
              onClick={() => setViewMode('tabela')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'tabela' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all whitespace-nowrap"
            title="Exportar dados filtrados para Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Section 15, 16) */}
      <div className="p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Condomínio</label>
          <select
            value={condoFilter}
            onChange={e => setCondoFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos (54)</option>
            {condominios.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Responsável</label>
          <select
            value={respFilter}
            onChange={e => setRespFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            {users.map(u => (
              <option key={u.id} value={u.nome}>
                {u.nome}
              </option>
            ))}
            <option value="Não cadastrado">Não cadastrado</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Atrasada">Atrasada</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Prioridade</label>
          <select
            value={prioridadeFilter}
            onChange={e => setPrioridadeFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tipo</label>
          <select
            value={tipoFilter}
            onChange={e => setTipoFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="Multa">Multa</option>
            <option value="Salão de festas">Salão de festas</option>
            <option value="Churrasqueira">Churrasqueira</option>
            <option value="Tarefa geral">Tarefa geral</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="flex items-end">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-800 text-blue-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Tabela (Section 16) */}
      {viewMode === 'tabela' ? (
        <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Condomínio</th>
                  <th className="py-3 px-4">Tarefa</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Prazo</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTarefas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Nenhuma tarefa encontrada com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredTarefas.map(t => {
                    const isDone = t.status === 'Concluída';
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-800/30 transition-colors ${isDone ? 'opacity-70' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <StatusBadge status={t.status as any} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-bold text-white dark:text-white light:text-slate-900">
                          {t.condominioNome}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            onClick={() => onOpenTaskDetail(t)}
                            className="font-medium text-slate-200 hover:text-blue-400 cursor-pointer block max-w-xs truncate"
                          >
                            {t.titulo}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {t.tipo} {t.checklist?.length ? `· ${t.checklist.filter(c => c.concluido).length}/${t.checklist.length} checklist` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {t.responsavelNome}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {t.prazo.split('-').reverse().join('/')}
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge prioridade={t.prioridade as any} />
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {t.valorCalculado !== undefined && t.valorCalculado > 0
                            ? `R$ ${t.valorCalculado.toFixed(2).replace('.', ',')}`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenTaskDetail(t)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Ver detalhes"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              onClick={() => onEditTask(t)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Editar tarefa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onToggleConcluir(t.id)}
                              className={`p-1 rounded-lg text-xs font-semibold ${
                                isDone ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title={isDone ? 'Reabrir' : 'Concluir'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTaskToDelete(t.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Section 11) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTarefas.map(t => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-400 truncate">
                    {t.condominioNome}
                  </span>
                  <StatusBadge status={t.status as any} size="sm" />
                </div>
                <h3
                  onClick={() => onOpenTaskDetail(t)}
                  className="text-sm font-semibold text-white hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug"
                >
                  {t.titulo}
                </h3>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Responsável:</span>
                    <strong className="text-slate-200">{t.responsavelNome}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Prazo:</span>
                    <span className="font-mono">{t.prazo.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prioridade:</span>
                    <PriorityBadge prioridade={t.prioridade as any} />
                  </div>
                  {t.valorCalculado !== undefined && t.valorCalculado > 0 && (
                    <div className="flex justify-between text-emerald-400 font-mono font-bold">
                      <span>Valor:</span>
                      <span>R$ {t.valorCalculado.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onOpenTaskDetail(t)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTask(t)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleConcluir(t.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(t.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal (Section 57) */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete);
            onToast('success', 'Tarefa excluída com sucesso.');
            setTaskToDelete(null);
          }
        }}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Os anexos e histórico vinculados a ela serão removidos permanentemente."
      />
    </div>
  );
};
