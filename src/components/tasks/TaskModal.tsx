import React, { useState, useEffect } from 'react';
import { Paperclip, Upload, DollarSign, X, CheckSquare, Plus } from 'lucide-react';
import {
  Condominio,
  User,
  Tarefa,
  TaskType,
  TaskPriority,
  GravidadeMulta,
  TaskAttachment,
  TaskChecklistItem
} from '../../types';
import { Modal } from '../common/Modal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  condominios: Condominio[];
  users: User[];
  currentUser: User;
  taskToEdit?: Tarefa | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  condominios,
  users,
  currentUser,
  taskToEdit
}) => {
  const [titulo, setTitulo] = useState('');
  const [condominioId, setCondominioId] = useState(condominios[0]?.id || '');
  const [tipo, setTipo] = useState<TaskType>('Tarefa geral');
  const [gravidade, setGravidade] = useState<GravidadeMulta>('Média');
  const [responsavelNome, setResponsavelNome] = useState(users[0]?.nome || '');
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [prioridade, setPrioridade] = useState<TaskPriority>('Média');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
  const [anexos, setAnexos] = useState<TaskAttachment[]>([]);
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newCheckItemText, setNewCheckItemText] = useState('');

  // When opening or editing
  useEffect(() => {
    if (taskToEdit) {
      setTitulo(taskToEdit.titulo);
      setCondominioId(taskToEdit.condominioId);
      setTipo(taskToEdit.tipo);
      setGravidade(taskToEdit.gravidade || 'Média');
      setResponsavelNome(taskToEdit.responsavelNome);
      setPrazo(taskToEdit.prazo);
      setPrioridade(taskToEdit.prioridade);
      setInformacoesAdicionais(taskToEdit.informacoesAdicionais || '');
      setAnexos(taskToEdit.anexos || []);
      setChecklist(taskToEdit.checklist || []);
    } else {
      setTitulo('');
      const defaultCondo = condominios[0];
      setCondominioId(defaultCondo?.id || '');
      setTipo('Tarefa geral');
      setGravidade('Média');
      // Automatically prefill responsible from default condominium! (Section 14)
      setResponsavelNome(defaultCondo?.responsavelNome || users[0]?.nome || 'Fabrício');

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);
      setPrazo(nextDate.toISOString().split('T')[0]);
      setPrioridade('Média');
      setInformacoesAdicionais('');
      setAnexos([]);
      setChecklist([]);
    }
  }, [taskToEdit, isOpen, condominios, users]);

  // When changing condominium on creation, auto-populate responsible (Section 14)
  const handleCondoChange = (newCondoId: string) => {
    setCondominioId(newCondoId);
    if (!taskToEdit) {
      const condo = condominios.find(c => c.id === newCondoId);
      if (condo && condo.responsavelNome) {
        setResponsavelNome(condo.responsavelNome);
      }
    }
  };

  const selectedCondo = condominios.find(c => c.id === condominioId) || condominios[0];

  // Dynamic values computation
  let valorCalculado: number | undefined = undefined;
  if (selectedCondo) {
    if (tipo === 'Multa') {
      if (gravidade === 'Leve') valorCalculado = selectedCondo.valorMultaLeve;
      else if (gravidade === 'Média') valorCalculado = selectedCondo.valorMultaMedia;
      else if (gravidade === 'Grave') valorCalculado = selectedCondo.valorMultaGrave;
    } else if (tipo === 'Salão de festas') {
      valorCalculado = selectedCondo.valorSalaoFestas;
    } else if (tipo === 'Churrasqueira') {
      valorCalculado = selectedCondo.valorChurrasqueira;
    }
  }

  // Real file upload to LocalStorage as dataURL (Section 21)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = event => {
        const dataUrl = event.target?.result as string;
        const newAtt: TaskAttachment = {
          id: `att_${Date.now()}_${i}`,
          nome: file.name,
          tamanho: `${(file.size / 1024).toFixed(1)} KB`,
          tipo: file.name.endsWith('.pdf') ? 'PDF' : file.type.includes('image') ? 'Imagem' : 'Documento',
          data: new Date().toLocaleDateString('pt-BR'),
          autorNome: currentUser.nome,
          dataUrl
        };
        setAnexos(prev => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAnexo = (id: string) => {
    setAnexos(prev => prev.filter(a => a.id !== id));
  };

  const handleAddChecklistItem = () => {
    if (!newCheckItemText.trim()) return;
    setChecklist(prev => [
      ...prev,
      {
        id: `chk_${Date.now()}_${Math.random()}`,
        texto: newCheckItemText.trim(),
        concluido: false
      }
    ]);
    setNewCheckItemText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondo) return;

    const matchedUser = users.find(u => u.nome.toLowerCase() === responsavelNome.toLowerCase());
    const finalRespId = matchedUser ? matchedUser.id : 'unassigned';
    const taskTitle = titulo.trim() || `${tipo} — ${selectedCondo.nome}`;

    onSave({
      id: taskToEdit?.id,
      titulo: taskTitle,
      condominioId: selectedCondo.id,
      condominioNome: selectedCondo.nome,
      tipo,
      gravidade: tipo === 'Multa' ? gravidade : undefined,
      valorCalculado,
      responsavelId: finalRespId,
      responsavelNome,
      prazo,
      prioridade,
      status: taskToEdit?.status || 'Pendente',
      informacoesAdicionais,
      anexos,
      checklist
    });

    onClose();
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return 'R$ 0,00';
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
      subtitle="Preencha os dados da demanda para a equipe"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Título da Tarefa *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder={`Ex: Conferir documentação ou ${tipo} — ${selectedCondo?.nome || 'Condomínio'}`}
            required
            className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Condomínio & Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Condomínio * (54 cadastrados)
            </label>
            <select
              value={condominioId}
              onChange={e => handleCondoChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              {condominios.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} (Padrão: {c.responsavelNome})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo de Tarefa *
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TaskType)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Tarefa geral">Tarefa geral</option>
              <option value="Multa">Multa</option>
              <option value="Salão de festas">Salão de festas</option>
              <option value="Churrasqueira">Churrasqueira</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>

        {/* Dynamic calculation box for Multa, Salão, Churrasqueira */}
        {tipo === 'Multa' && (
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-200 block">Gravidade da Multa</span>
                <div className="flex items-center gap-2 mt-1">
                  {(['Leve', 'Média', 'Grave'] as GravidadeMulta[]).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGravidade(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        gravidade === g ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-blue-300 block">Valor da Multa</span>
                <span className="text-base font-bold text-white font-mono">{formatCurrency(valorCalculado)}</span>
              </div>
            </div>
          </div>
        )}

        {tipo === 'Salão de festas' && (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs">
            <span className="text-indigo-200 font-semibold">Valor do salão de festas cadastrado</span>
            <span className="text-base font-bold text-white font-mono">{formatCurrency(valorCalculado)}</span>
          </div>
        )}

        {tipo === 'Churrasqueira' && (
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between text-xs">
            <span className="text-purple-200 font-semibold">Valor da churrasqueira cadastrado</span>
            <span className="text-base font-bold text-white font-mono">{formatCurrency(valorCalculado)}</span>
          </div>
        )}

        {/* Responsável, Data de Entrega & Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Responsável * (Automático)
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Data de Entrega *
            </label>
            <input
              type="date"
              value={prazo}
              onChange={e => setPrazo(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Prioridade *
            </label>
            <select
              value={prioridade}
              onChange={e => setPrioridade(e.target.value as TaskPriority)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Checklist da Tarefa (Section 23) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Checklist da Tarefa (Etapas)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCheckItemText}
              onChange={e => setNewCheckItemText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Ex: Verificar documentação, Conferir valor..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {checklist.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <span className="text-slate-200">{item.texto}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anexos com Upload Real (Section 21) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Anexo / Mídia (Upload real no navegador)
          </label>
          <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 hover:border-blue-500 transition-colors text-xs text-slate-400">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Selecionar arquivo (PDF, imagens, documentos)</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>

          {anexos.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {anexos.map(att => (
                <div
                  key={att.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate text-slate-200 font-medium">{att.nome}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({att.tamanho})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnexo(att.id)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Informações Adicionais
          </label>
          <textarea
            value={informacoesAdicionais}
            onChange={e => setInformacoesAdicionais(e.target.value)}
            rows={2}
            placeholder="Observações complementares, número de protocolo..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
          >
            {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
