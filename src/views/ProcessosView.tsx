import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  CheckSquare,
  Square,
  Clock,
  User,
  MessageSquare,
  Calendar,
  Building2,
  Search,
  CheckCircle2,
  Edit,
  X
} from 'lucide-react';
import {
  PeriodoProcesso,
  ProcessoCard,
  Condominio,
  User as UserType
} from '../types';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ExcelService } from '../services/excelService';

interface ProcessosViewProps {
  tipo: 'balancete' | 'boleto';
  periodos: PeriodoProcesso[];
  cards: ProcessoCard[];
  condominios: Condominio[];
  users: UserType[];
  currentUser: UserType;
  onCreatePeriodo: (mes: string, ano: string, condoIds: string[]) => void;
  onToggleChecklist: (cardId: string, checkItemId: string) => void;
  onUpdateCardInfo: (cardId: string, info: string) => void;
  onUpdateCardResponsavel: (cardId: string, respId: string, respNome: string) => void;
  onAddCommentCard: (cardId: string, text: string) => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ProcessosView: React.FC<ProcessosViewProps> = ({
  tipo,
  periodos,
  cards,
  condominios,
  users,
  currentUser,
  onCreatePeriodo,
  onToggleChecklist,
  onUpdateCardInfo,
  onUpdateCardResponsavel,
  onAddCommentCard,
  onToast
}) => {
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>(
    periodos[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [respFilter, setRespFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isNovoPeriodoOpen, setIsNovoPeriodoOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<ProcessoCard | null>(null);

  // Form states for Novo Periodo (Section 28)
  const [novoMes, setNovoMes] = useState('Outubro');
  const [novoAno, setNovoAno] = useState('2026');
  const [selectAllCondos, setSelectAllCondos] = useState(false);
  const [selectedCondoIds, setSelectedCondoIds] = useState<string[]>(
    condominios.slice(0, 10).map(c => c.id)
  );

  const activePeriodo = periodos.find(p => p.id === selectedPeriodoId) || periodos[0];
  const activeCards = cards.filter(c => c.periodoId === activePeriodo?.id);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return activeCards.filter(c => {
      if (respFilter) {
        if (respFilter === 'Não cadastrado' && c.responsavelNome !== 'Não cadastrado') return false;
        if (respFilter !== 'Não cadastrado' && c.responsavelNome.toLowerCase() !== respFilter.toLowerCase()) return false;
      }
      if (statusFilter && c.status !== statusFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        if (!c.condominioNome.toLowerCase().includes(query) && !c.responsavelNome.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeCards, respFilter, statusFilter, searchTerm]);

  // Handle select all toggle
  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAllCondos(checked);
    if (checked) {
      setSelectedCondoIds(condominios.map(c => c.id));
    } else {
      setSelectedCondoIds([]);
    }
  };

  const handleCreatePeriodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCondoIds.length === 0) {
      onToast('warning', 'Selecione ao menos um condomínio');
      return;
    }
    onCreatePeriodo(novoMes, novoAno, selectedCondoIds);
    setIsNovoPeriodoOpen(false);
    onToast('success', `Período ${novoMes}/${novoAno} criado com sucesso.`, `${selectedCondoIds.length} condomínios atribuídos.`);
  };

  const handleExportExcel = () => {
    try {
      ExcelService.exportBalancetesToExcel(filteredCards, periodos);
      onToast('success', 'Excel exportado com sucesso.', `PULSO95_${tipo === 'balancete' ? 'Balancetes' : 'Boletos'}.xlsx`);
    } catch {
      onToast('warning', 'Erro ao exportar Excel');
    }
  };

  const isBalancete = tipo === 'balancete';
  const titleDisplay = isBalancete ? 'Balancetes' : 'Boletos';

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Período:</span>
            <select
              value={activePeriodo?.id || ''}
              onChange={e => setSelectedPeriodoId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              {periodos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.mesAno}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar condomínio..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Responsável filter (Section 15) */}
          <select
            value={respFilter}
            onChange={e => setRespFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos responsáveis</option>
            {users.map(u => (
              <option key={u.id} value={u.nome}>
                {u.nome}
              </option>
            ))}
            <option value="Não cadastrado">Não cadastrado</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
        </div>

        {/* Buttons: Exportar Excel & Novo Período */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setIsNovoPeriodoOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo período</span>
          </button>
        </div>
      </div>

      {/* Cards Grid (Section 29) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#111827] border border-[#1E293B]">
            <p className="text-sm font-semibold text-slate-300">Nenhum processo neste período</p>
            <p className="text-xs text-slate-500 mt-1">
              Clique em "+ Novo período" para iniciar o ciclo operacional com os condomínios selecionados.
            </p>
          </div>
        ) : (
          filteredCards.map(card => {
            const isCompleted = card.status === 'Concluída';
            const totalSteps = card.checklist.length;
            const doneSteps = card.checklist.filter(i => i.concluido).length;
            const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

            return (
              <div
                key={card.id}
                className={`p-5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-[#1E293B] hover:border-blue-500/40'
                }`}
              >
                <div>
                  {/* Card Header (Section 29) */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 leading-tight">
                        {card.condominioNome}
                      </h3>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {activePeriodo?.mesAno} · Responsável: <strong className="text-slate-200">{card.responsavelNome}</strong>
                      </span>
                    </div>

                    <StatusBadge status={card.status as any} size="sm" />
                  </div>

                  {/* Progress Header */}
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-400 font-mono">
                    <span>{doneSteps}/{totalSteps} — {percent}%</span>
                    {card.concluidoEm && (
                      <span className="text-[10px] text-emerald-400 font-normal">
                        Concluído em {card.concluidoEm}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1 mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Checklist (Section 30) */}
                  <div className="space-y-1.5 pt-1">
                    {card.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => onToggleChecklist(card.id, item.id)}
                        className={`flex items-start justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                          item.concluido
                            ? 'bg-blue-950/20 border-blue-900/40 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.concluido ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className={item.concluido ? 'line-through text-slate-400' : 'font-medium'}>
                            {item.label}
                          </span>
                        </div>

                        {item.concluido && item.concluidoEm && (
                          <span className="text-[10px] font-mono text-emerald-400/90 shrink-0 ml-2">
                            {item.concluidoEm}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Informações adicionais editáveis */}
                  <div className="mt-3 pt-2">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Informações Adicionais
                    </label>
                    <textarea
                      defaultValue={card.informacoesAdicionais}
                      onBlur={e => onUpdateCardInfo(card.id, e.target.value)}
                      placeholder="Ex: Conta de água apresentou diferença. Conferir lançamento..."
                      rows={2}
                      className="w-full p-2 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCardForEdit(card)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Detalhes & Conversa</span>
                  </button>

                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: #{card.id.slice(-6)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Novo Período (Section 28) */}
      <Modal
        isOpen={isNovoPeriodoOpen}
        onClose={() => setIsNovoPeriodoOpen(false)}
        title={`+ Novo Período de ${titleDisplay}`}
        subtitle="O responsável de cada condomínio será atribuído automaticamente"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePeriodoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mês *</label>
              <select
                value={novoMes}
                onChange={e => setNovoMes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                {MESES.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ano *</label>
              <input
                type="text"
                value={novoAno}
                onChange={e => setNovoAno(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Condomínios a Incluir ({selectedCondoIds.length} selecionados)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-blue-400 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={selectAllCondos || selectedCondoIds.length === condominios.length}
                  onChange={e => handleToggleSelectAll(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Selecionar todos (54)</span>
              </label>
            </div>

            <div className="max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              {condominios.map(c => {
                const isChecked = selectedCondoIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center justify-between p-1.5 px-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCondoIds(prev => prev.filter(id => id !== c.id));
                            setSelectAllCondos(false);
                          } else {
                            setSelectedCondoIds(prev => [...prev, c.id]);
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-slate-200 font-medium">{c.nome}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Padrão: {c.responsavelNome}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNovoPeriodoOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
            >
              Criar Período com Responsáveis Automáticos
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhes & Edição do Processo (Section 31) */}
      {selectedCardForEdit && (
        <Modal
          isOpen={!!selectedCardForEdit}
          onClose={() => setSelectedCardForEdit(null)}
          title={`${titleDisplay} — ${selectedCardForEdit.condominioNome}`}
          subtitle={`Período: ${activePeriodo?.mesAno}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Responsável do Processo
                </label>
                <select
                  value={selectedCardForEdit.responsavelNome}
                  onChange={e => {
                    const newName = e.target.value;
                    const matched = users.find(u => u.nome.toLowerCase() === newName.toLowerCase());
                    onUpdateCardResponsavel(selectedCardForEdit.id, matched ? matched.id : 'unassigned', newName);
                    setSelectedCardForEdit(prev => prev ? { ...prev, responsavelNome: newName } : null);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nome}>
                      {u.nome} ({u.role === 'master' ? 'Master' : 'Colaborador'})
                    </option>
                  ))}
                  <option value="Não cadastrado">Não cadastrado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status
                </label>
                <div className="pt-2">
                  <StatusBadge status={selectedCardForEdit.status as any} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Informações Adicionais
              </label>
              <textarea
                value={selectedCardForEdit.informacoesAdicionais}
                onChange={e => {
                  const val = e.target.value;
                  onUpdateCardInfo(selectedCardForEdit.id, val);
                  setSelectedCardForEdit(prev => prev ? { ...prev, informacoesAdicionais: val } : null);
                }}
                rows={3}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCardForEdit(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
