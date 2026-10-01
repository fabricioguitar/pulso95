import React, { useState, useMemo } from 'react';
import {
  Printer,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Building2,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { XeroxRegistro, Condominio, User as UserType, IdentidadeConfig } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface XeroxViewProps {
  xeroxList: XeroxRegistro[];
  condominios: Condominio[];
  currentUser: UserType;
  identidade: IdentidadeConfig;
  onSaveXerox: (registro: Omit<XeroxRegistro, 'id'> & { id?: string }) => void;
  onDeleteXerox: (id: string) => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const XeroxView: React.FC<XeroxViewProps> = ({
  xeroxList,
  condominios,
  currentUser,
  identidade,
  onSaveXerox,
  onDeleteXerox,
  onToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<XeroxRegistro | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [condoFilter, setCondoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  // Form State
  const [condominioId, setCondominioId] = useState(condominios[0]?.id || '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'preto_branco' | 'colorida'>('preto_branco');
  const [quantidade, setQuantidade] = useState<number>(30);
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');

  const openNewModal = () => {
    setEditingItem(null);
    setCondominioId(condominios[0]?.id || '');
    setData(new Date().toISOString().split('T')[0]);
    setTipo('preto_branco');
    setQuantidade(30);
    setInformacoesAdicionais('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: XeroxRegistro) => {
    setEditingItem(item);
    setCondominioId(item.condominioId);
    setData(item.data);
    setTipo(item.tipo);
    setQuantidade(item.quantidade);
    setInformacoesAdicionais(item.informacoesAdicionais || '');
    setIsModalOpen(true);
  };

  // Unit pricing from settings (Section 35)
  const valorUnitario = tipo === 'preto_branco' ? identidade.precoXeroxPreto : identidade.precoXeroxColorida;
  const valorTotal = quantidade * valorUnitario;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const condo = condominios.find(c => c.id === condominioId) || condominios[0];
    if (!condo) return;

    onSaveXerox({
      id: editingItem?.id,
      condominioId: condo.id,
      condominioNome: condo.nome,
      data,
      tipo,
      quantidade,
      valorUnitario,
      valorTotal,
      informacoesAdicionais,
      registradoPor: currentUser.nome
    });

    setIsModalOpen(false);
    onToast('success', editingItem ? 'Registro de Xerox atualizado.' : 'Xerox registrada com sucesso.');
  };

  const filteredList = useMemo(() => {
    return xeroxList.filter(item => {
      if (condoFilter && item.condominioId !== condoFilter) return false;
      if (tipoFilter !== 'todos' && item.tipo !== tipoFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        if (
          !item.condominioNome.toLowerCase().includes(query) &&
          !item.informacoesAdicionais?.toLowerCase().includes(query) &&
          !item.registradoPor.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [xeroxList, condoFilter, tipoFilter, searchTerm]);

  const totalCopias = filteredList.reduce((acc, curr) => acc + curr.quantidade, 0);
  const totalGasto = filteredList.reduce((acc, curr) => acc + curr.valorTotal, 0);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[11px] text-slate-400 block">Total de Cópias</span>
          <span className="text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono tabular-nums block mt-1">
            {totalCopias}
          </span>
          <span className="text-[10px] text-slate-500">Impressões computadas</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[11px] text-slate-400 block">Faturamento Total</span>
          <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums block mt-1">
            R$ {totalGasto.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-emerald-500/80">Rateio para condomínios</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[11px] text-slate-400 block">Preto e Branco</span>
          <span className="text-xl font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono tabular-nums block mt-1">
            R$ {identidade.precoXeroxPreto.toFixed(2).replace('.', ',')} / un
          </span>
          <span className="text-[10px] text-slate-500">Valor configurável</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[11px] text-slate-400 block">Colorida</span>
          <span className="text-xl font-bold text-blue-400 font-mono tabular-nums block mt-1">
            R$ {identidade.precoXeroxColorida.toFixed(2).replace('.', ',')} / un
          </span>
          <span className="text-[10px] text-blue-400/80">Valor configurável</span>
        </div>
      </div>

      {/* Filter and Register Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por condomínio ou observação..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={condoFilter}
            onChange={e => setCondoFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os condomínios</option>
            {condominios.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            value={tipoFilter}
            onChange={e => setTipoFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todos os tipos</option>
            <option value="preto_branco">Preto e Branco</option>
            <option value="colorida">Colorida</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Xerox</span>
        </button>
      </div>

      {/* Xerox Table (Section 36) */}
      <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Condomínio</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Quantidade</th>
                <th className="py-3 px-4 text-right">Unitário</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Informações</th>
                <th className="py-3 px-4">Registrado por</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Nenhum registro de impressão encontrado.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white dark:text-white light:text-slate-900">
                      {item.condominioNome}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.data.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        item.tipo === 'colorida'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-300'
                      }`}>
                        {item.tipo === 'colorida' ? 'Colorida' : 'Preto e Branco'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      {item.quantidade}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      R$ {item.valorUnitario.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {item.informacoesAdicionais || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {item.registradoPor}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                          title="Editar registro"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar / Editar Xerox */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Registro de Xerox' : 'Registrar Xerox'}
        subtitle="O valor unitário é preenchido automaticamente conforme a configuração"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Condomínio *
            </label>
            <select
              value={condominioId}
              onChange={e => setCondominioId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              {condominios.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo *
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as any)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="preto_branco">Preto e Branco (R$ {identidade.precoXeroxPreto.toFixed(2).replace('.', ',')})</option>
                <option value="colorida">Colorida (R$ {identidade.precoXeroxColorida.toFixed(2).replace('.', ',')})</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantidade de Cópias *
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Automatic calculation */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-blue-300 block">Cálculo Automático</span>
              <span className="font-mono text-slate-200">
                {quantidade} cópias × R$ {valorUnitario.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block">Total</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Informações
            </label>
            <textarea
              value={informacoesAdicionais}
              onChange={e => setInformacoesAdicionais(e.target.value)}
              placeholder="Ex: Editais impressos para colar nos quadros de aviso..."
              rows={2}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
            >
              {editingItem ? 'Salvar Alterações' : 'Gravar Registro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteXerox(itemToDelete);
            onToast('success', 'Registro de Xerox excluído.');
            setItemToDelete(null);
          }
        }}
        title="Excluir Registro de Xerox"
        message="Tem certeza que deseja excluir este registro de impressão?"
      />
    </div>
  );
};
