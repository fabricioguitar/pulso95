import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Building2,
  FileText,
  Mail,
  Receipt,
  Download,
  Upload,
  Trash2,
  Edit,
  X,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { Assembleia, Condominio, User as UserType, TaskAttachment } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface AssembleiasViewProps {
  assembleias: Assembleia[];
  condominios: Condominio[];
  currentUser: UserType;
  onSaveAssembleia: (data: Omit<Assembleia, 'id'> & { id?: string }) => void;
  onDeleteAssembleia: (id: string) => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const AssembleiasView: React.FC<AssembleiasViewProps> = ({
  assembleias,
  condominios,
  currentUser,
  onSaveAssembleia,
  onDeleteAssembleia,
  onToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assembleia | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [condominioId, setCondominioId] = useState(condominios[0]?.id || '');
  const [data, setData] = useState('2026-10-15');
  const [horario, setHorario] = useState('19:30');
  const [editalTexto, setEditalTexto] = useState('');
  const [editalArquivo, setEditalArquivo] = useState<TaskAttachment | undefined>(undefined);
  const [boletoArquivo, setBoletoArquivo] = useState<TaskAttachment | undefined>(undefined);
  const [informacoesBoleto, setInformacoesBoleto] = useState('');
  const [emailsAdicionais, setEmailsAdicionais] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const openNewModal = () => {
    setEditingItem(null);
    setCondominioId(condominios[0]?.id || '');
    setData('2026-10-15');
    setHorario('19:30');
    setEditalTexto('');
    setEditalArquivo(undefined);
    setBoletoArquivo(undefined);
    setInformacoesBoleto('');
    setEmailsAdicionais('');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ass: Assembleia) => {
    setEditingItem(ass);
    setCondominioId(ass.condominioId);
    setData(ass.data);
    setHorario(ass.horario);
    setEditalTexto(ass.editalTexto || '');
    setEditalArquivo(ass.editalArquivo);
    setBoletoArquivo(ass.boletoArquivo);
    setInformacoesBoleto(ass.informacoesBoleto || '');
    setEmailsAdicionais(ass.emailsAdicionais || '');
    setObservacoes(ass.observacoes || '');
    setIsModalOpen(true);
  };

  // Upload edital file (Section 38)
  const handleEditalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      setEditalArquivo({
        id: `att_edital_${Date.now()}`,
        nome: file.name,
        tamanho: `${(file.size / 1024).toFixed(1)} KB`,
        tipo: file.name.endsWith('.pdf') ? 'PDF' : 'Documento',
        data: new Date().toLocaleDateString('pt-BR'),
        autorNome: currentUser.nome,
        dataUrl: ev.target?.result as string
      });
      onToast('info', 'Edital anexado', file.name);
    };
    reader.readAsDataURL(file);
  };

  // Upload boleto file (Section 39)
  const handleBoletoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      setBoletoArquivo({
        id: `att_boleto_${Date.now()}`,
        nome: file.name,
        tamanho: `${(file.size / 1024).toFixed(1)} KB`,
        tipo: file.name.endsWith('.pdf') ? 'PDF' : 'Documento',
        data: new Date().toLocaleDateString('pt-BR'),
        autorNome: currentUser.nome,
        dataUrl: ev.target?.result as string
      });
      onToast('info', 'Boleto da assembleia anexado', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const condo = condominios.find(c => c.id === condominioId) || condominios[0];
    if (!condo) return;

    onSaveAssembleia({
      id: editingItem?.id,
      condominioId: condo.id,
      condominioNome: condo.nome,
      data,
      horario,
      editalTexto: editalTexto.trim() || `Assembleia Geral — ${condo.nome}`,
      editalArquivo,
      boletoArquivo,
      informacoesBoleto: informacoesBoleto.trim(),
      emailsAdicionais: emailsAdicionais.trim(),
      observacoes: observacoes.trim(),
      status: 'agendada'
    });

    setIsModalOpen(false);
    onToast('success', editingItem ? 'Assembleia atualizada.' : 'Assembleia agendada com sucesso.');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
            Assembleias Gerais
          </h2>
          <p className="text-xs text-slate-400">
            Convocatórias com upload de edital e comprovantes de boleto
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova assembleia</span>
        </button>
      </div>

      {/* Assembleias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assembleias.map(ass => (
          <div
            key={ass.id}
            className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] p-5 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
                      {ass.condominioNome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-300 mt-0.5">
                      <span>{ass.data.split('-').reverse().join('/')}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ass.horario}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(ass)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Editar assembleia"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setItemToDelete(ass.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Excluir assembleia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Edital & Arquivo (Section 38) */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Edital da Assembleia
                  </span>
                  <p className="text-slate-300 leading-relaxed mb-2">
                    {ass.editalTexto}
                  </p>

                  {/* Edital Arquivo */}
                  {ass.editalArquivo ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/20 border border-blue-900/30">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate text-blue-200 font-medium">{ass.editalArquivo.nome}</span>
                      </div>
                      {ass.editalArquivo.dataUrl && (
                        <a
                          href={ass.editalArquivo.dataUrl}
                          download={ass.editalArquivo.nome}
                          className="p-1 text-blue-400 hover:text-white"
                          title="Baixar edital"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block">
                      Arquivo do edital não anexado.
                    </span>
                  )}
                </div>

                {/* Boleto Arquivo (Section 39) */}
                {ass.boletoArquivo && (
                  <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate text-slate-300 font-medium">{ass.boletoArquivo.nome}</span>
                    </div>
                    {ass.boletoArquivo.dataUrl && (
                      <a
                        href={ass.boletoArquivo.dataUrl}
                        download={ass.boletoArquivo.nome}
                        className="p-1 text-emerald-400 hover:text-white"
                        title="Baixar boleto da assembleia"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {ass.informacoesBoleto && (
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                      Texto do Boleto:
                    </span>
                    <span className="text-slate-300">{ass.informacoesBoleto}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 truncate">
              {ass.emailsAdicionais || 'Sem e-mails adicionais'}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova / Editar Assembleia */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Assembleia' : 'Nova Assembleia'}
        subtitle="O edital deve ser um arquivo real anexado"
        maxWidth="lg"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Horário *</label>
              <input
                type="time"
                value={horario}
                onChange={e => setHorario(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pauta / Descrição do Edital *
            </label>
            <textarea
              value={editalTexto}
              onChange={e => setEditalTexto(e.target.value)}
              rows={2}
              required
              placeholder="Ex: Assembleia Geral Ordinária para eleição de síndico e previsão orçamentária..."
              className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Upload Arquivo do Edital (Section 38) */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              Arquivo do Edital (PDF, DOC, DOCX) *
            </span>

            {editalArquivo ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-blue-200 truncate font-medium">{editalArquivo.nome}</span>
                  <span className="text-[10px] text-slate-400">({editalArquivo.tamanho})</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="cursor-pointer text-[11px] text-blue-400 hover:text-white font-medium">
                    Substituir
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleEditalFileUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditalArquivo(undefined)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 transition-colors text-xs text-slate-400">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Anexar arquivo do edital (PDF, DOC)</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleEditalFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Upload Arquivo do Boleto da Assembleia (Section 39) */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              Boleto da Assembleia (Opcional)
            </span>

            {boletoArquivo ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200 truncate font-medium">{boletoArquivo.nome}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="cursor-pointer text-[11px] text-emerald-400 hover:text-white font-medium">
                    Substituir
                    <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleBoletoFileUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setBoletoArquivo(undefined)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 transition-colors text-xs text-slate-400">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Anexar boleto / modelo de taxa</span>
                <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleBoletoFileUpload} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Informações para o Rodapé do Boleto
            </label>
            <input
              type="text"
              value={informacoesBoleto}
              onChange={e => setInformacoesBoleto(e.target.value)}
              placeholder="Ex: Constar quitação necessária para voto..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-mails de Convocação
            </label>
            <input
              type="text"
              value={emailsAdicionais}
              onChange={e => setEmailsAdicionais(e.target.value)}
              placeholder="sindico@condominio.com.br, conselho@condominio.com.br"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
              {editingItem ? 'Salvar Alterações' : 'Agendar Assembleia'}
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
            onDeleteAssembleia(itemToDelete);
            onToast('success', 'Assembleia excluída.');
            setItemToDelete(null);
          }
        }}
        title="Excluir Assembleia"
        message="Tem certeza que deseja excluir esta assembleia e seus arquivos anexados?"
      />
    </div>
  );
};
