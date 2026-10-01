import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  DollarSign,
  User,
  Edit,
  Trash2,
  Eye,
  Download,
  X
} from 'lucide-react';
import { Condominio, User as UserType } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ExcelService } from '../services/excelService';

interface CondominiosViewProps {
  condominios: Condominio[];
  users: UserType[];
  onSaveCondominio: (condo: Omit<Condominio, 'id'> & { id?: string }) => void;
  onDeleteCondominio: (id: string) => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const CondominiosView: React.FC<CondominiosViewProps> = ({
  condominios,
  users,
  onSaveCondominio,
  onDeleteCondominio,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [respFilter, setRespFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCondo, setEditingCondo] = useState<Condominio | null>(null);
  const [condoToDelete, setCondoToDelete] = useState<Condominio | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [responsavelNome, setResponsavelNome] = useState(() => users[0]?.nome || 'Fabrício');
  const [valorSalaoFestas, setValorSalaoFestas] = useState('0');
  const [valorChurrasqueira, setValorChurrasqueira] = useState('0');
  const [valorMultaLeve, setValorMultaLeve] = useState('0');
  const [valorMultaMedia, setValorMultaMedia] = useState('0');
  const [valorMultaGrave, setValorMultaGrave] = useState('0');
  const [endereco, setEndereco] = useState('');

  const openNewModal = () => {
    setEditingCondo(null);
    setNome('');
    setResponsavelNome(users[0]?.nome || 'Fabrício');
    setValorSalaoFestas('0');
    setValorChurrasqueira('0');
    setValorMultaLeve('0');
    setValorMultaMedia('0');
    setValorMultaGrave('0');
    setEndereco('');
    setIsModalOpen(true);
  };

  const openEditModal = (condo: Condominio) => {
    setEditingCondo(condo);
    setNome(condo.nome);
    setResponsavelNome(condo.responsavelNome);
    setValorSalaoFestas(condo.valorSalaoFestas.toString());
    setValorChurrasqueira(condo.valorChurrasqueira.toString());
    setValorMultaLeve(condo.valorMultaLeve.toString());
    setValorMultaMedia(condo.valorMultaMedia.toString());
    setValorMultaGrave(condo.valorMultaGrave.toString());
    setEndereco(condo.endereco || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = users.find(u => u.nome.toLowerCase() === responsavelNome.toLowerCase());
    const finalRespId = matchedUser ? matchedUser.id : 'unassigned';

    onSaveCondominio({
      id: editingCondo?.id,
      nome: nome.trim().toUpperCase(),
      responsavelId: finalRespId,
      responsavelNome,
      valorSalaoFestas: parseFloat(valorSalaoFestas) || 0,
      valorChurrasqueira: parseFloat(valorChurrasqueira) || 0,
      valorMultaLeve: parseFloat(valorMultaLeve) || 0,
      valorMultaMedia: parseFloat(valorMultaMedia) || 0,
      valorMultaGrave: parseFloat(valorMultaGrave) || 0,
      endereco: endereco.trim() || 'São Paulo - SP'
    });

    setIsModalOpen(false);
  };

  const filteredCondos = useMemo(() => {
    return condominios.filter(c => {
      if (respFilter && c.responsavelNome !== respFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        if (!c.nome.toLowerCase().includes(query) && !c.responsavelNome.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [condominios, respFilter, searchTerm]);

  const handleExportExcel = () => {
    try {
      ExcelService.exportCondominiosToExcel(filteredCondos);
      onToast('success', 'Excel exportado com sucesso.', `${filteredCondos.length} condomínios exportados.`);
    } catch {
      onToast('warning', 'Erro ao exportar Excel');
    }
  };

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar entre os 54 condomínios cadastrados..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={respFilter}
            onChange={e => setRespFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#111827] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos responsáveis</option>
            {users.map(u => (
              <option key={u.id} value={u.nome}>
                {u.nome}
              </option>
            ))}
            <option value="Não cadastrado">Não cadastrado</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo condomínio</span>
          </button>
        </div>
      </div>

      {/* Condomínios Table (Section 11) */}
      <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Condomínio</th>
                <th className="py-3 px-4">Responsável Padrão</th>
                <th className="py-3 px-4 text-right">Salão</th>
                <th className="py-3 px-4 text-right">Churrasqueira</th>
                <th className="py-3 px-4 text-right">Multa Leve</th>
                <th className="py-3 px-4 text-right">Multa Média</th>
                <th className="py-3 px-4 text-right">Multa Grave</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCondos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Nenhum condomínio encontrado.
                  </td>
                </tr>
              ) : (
                filteredCondos.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-white dark:text-white light:text-slate-900">
                      {c.nome}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.responsavelNome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(c.valorSalaoFestas)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(c.valorChurrasqueira)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatCurrency(c.valorMultaLeve)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-blue-400">
                      {formatCurrency(c.valorMultaMedia)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">
                      {formatCurrency(c.valorMultaGrave)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Editar condomínio e valores"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCondoToDelete(c)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Excluir condomínio"
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

      {/* Modal Novo / Editar Condomínio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCondo ? `Editar: ${editingCondo.nome}` : 'Novo Condomínio'}
        subtitle="Configure o responsável padrão e valores automáticos de salão e multas"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome do Condomínio *
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              placeholder="Ex: RESIDENCIAL JARDINS"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Responsável Padrão *
            </label>
            <select
              value={responsavelNome}
              onChange={e => setResponsavelNome(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.nome}>
                  {u.nome} ({u.role === 'master' ? 'Master' : 'Colaborador'})
                </option>
              ))}
              <option value="Não cadastrado">Não cadastrado</option>
            </select>
            <span className="text-[10px] text-slate-500 block mt-1">
              Será preenchido automaticamente ao criar novas tarefas e balancetes deste condomínio.
            </span>
          </div>

          {/* Áreas de lazer */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salão de Festas (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valorSalaoFestas}
                onChange={e => setValorSalaoFestas(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Churrasqueira (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valorChurrasqueira}
                onChange={e => setValorChurrasqueira(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Multas */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-blue-300 block">
              Tabela de Multas (R$)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Leve</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorMultaLeve}
                  onChange={e => setValorMultaLeve(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Média</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorMultaMedia}
                  onChange={e => setValorMultaMedia(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Grave</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorMultaGrave}
                  onChange={e => setValorMultaGrave(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
              {editingCondo ? 'Salvar Alterações' : 'Cadastrar Condomínio'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Section 57) */}
      <ConfirmModal
        isOpen={!!condoToDelete}
        onClose={() => setCondoToDelete(null)}
        onConfirm={() => {
          if (condoToDelete) {
            onDeleteCondominio(condoToDelete.id);
            onToast('success', 'Condomínio excluído.');
            setCondoToDelete(null);
          }
        }}
        title="Excluir Condomínio"
        message={`Tem certeza que deseja excluir o condomínio "${condoToDelete?.nome}"? Esta ação removerá o condomínio da lista.`}
      />
    </div>
  );
};
