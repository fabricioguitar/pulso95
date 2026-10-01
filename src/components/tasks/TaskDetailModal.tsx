import React, { useState } from 'react';
import {
  Calendar,
  User,
  Paperclip,
  Send,
  Building2,
  DollarSign,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  Plus,
  Square,
  CheckSquare,
  X
} from 'lucide-react';
import { Tarefa, User as UserType, TaskAttachment } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { UserAvatar } from '../common/UserAvatar';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Tarefa | null;
  currentUser: UserType;
  onToggleConcluir: (id: string) => void;
  onEdit: (task: Tarefa) => void;
  onDelete: (id: string) => void;
  onAddComment: (taskId: string, commentText: string) => void;
  onUpdateTask: (task: Tarefa) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onToggleConcluir,
  onEdit,
  onDelete,
  onAddComment,
  onUpdateTask
}) => {
  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!task) return null;

  const isConcluido = task.status === 'Concluída';

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText.trim());
    setCommentText('');
  };

  // Toggle checklist item
  const handleToggleChecklist = (checkId: string) => {
    const updatedChecklist = (task.checklist || []).map(item => {
      if (item.id === checkId) {
        const isNowDone = !item.concluido;
        return {
          ...item,
          concluido: isNowDone,
          concluidoPor: isNowDone ? currentUser.nome : undefined,
          concluidoEm: isNowDone ? new Date().toLocaleDateString('pt-BR') : undefined
        };
      }
      return item;
    });

    onUpdateTask({
      ...task,
      checklist: updatedChecklist
    });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: `chk_${Date.now()}_${Math.random()}`,
      texto: newChecklistText.trim(),
      concluido: false
    };

    onUpdateTask({
      ...task,
      checklist: [...(task.checklist || []), newItem]
    });
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (checkId: string) => {
    onUpdateTask({
      ...task,
      checklist: (task.checklist || []).filter(c => c.id !== checkId)
    });
  };

  // Attachments handlers
  const handleRemoveAttachment = (attId: string) => {
    onUpdateTask({
      ...task,
      anexos: (task.anexos || []).filter(a => a.id !== attId)
    });
  };

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
        onUpdateTask({
          ...task,
          anexos: [...(task.anexos || []), newAtt]
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Checklist calculations
  const totalCheck = task.checklist?.length || 0;
  const doneCheck = task.checklist?.filter(c => c.concluido).length || 0;
  const checkPercent = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.titulo}
      subtitle={`Criado por ${task.criadoPor || 'Fabrício'} em ${task.criadoEm}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status as any} />
            <PriorityBadge prioridade={task.prioridade as any} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleConcluir(task.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isConcluido
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConcluido ? 'Reabrir Demanda' : 'Concluir Tarefa'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-400" /> Condomínio
            </span>
            <span className="text-xs font-bold text-white mt-0.5 block truncate">
              {task.condominioNome}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-400" /> Responsável
            </span>
            <span className="text-xs font-bold text-white mt-0.5 block truncate">
              {task.responsavelNome}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" /> Prazo
            </span>
            <span className="text-xs font-bold text-white mt-0.5 block font-mono">
              {task.prazo.split('-').reverse().join('/')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Valor
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono">
              {task.valorCalculado !== undefined
                ? `R$ ${task.valorCalculado.toFixed(2).replace('.', ',')}`
                : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* Informações adicionais */}
        {task.informacoesAdicionais && (
          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/80 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
              Informações Adicionais
            </span>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {task.informacoesAdicionais}
            </p>
          </div>
        )}

        {/* Checklist da Tarefa (Section 23) */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span>Checklist da Tarefa</span>
              {totalCheck > 0 && (
                <span className="text-[11px] text-blue-400 font-mono">
                  {doneCheck}/{totalCheck} concluídos — {checkPercent}%
                </span>
              )}
            </span>
          </div>

          {/* Progress bar */}
          {totalCheck > 0 && (
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${checkPercent}%` }}
              />
            </div>
          )}

          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {(!task.checklist || task.checklist.length === 0) ? (
              <p className="text-xs text-slate-500 py-1">Nenhuma etapa no checklist.</p>
            ) : (
              task.checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <div
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                  >
                    {item.concluido ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        item.concluido ? 'line-through text-slate-400' : 'text-slate-200 font-medium'
                      }`}
                    >
                      {item.texto}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.concluido && item.concluidoPor && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.concluidoPor}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveChecklist(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add checklist item */}
          <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newChecklistText}
              onChange={e => setNewChecklistText(e.target.value)}
              placeholder="Adicionar nova etapa ao checklist..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!newChecklistText.trim()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Adicionar
            </button>
          </form>
        </div>

        {/* Anexos (Section 21) */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-blue-400" />
              <span>Anexos da Tarefa ({task.anexos?.length || 0})</span>
            </span>

            <label className="cursor-pointer text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Anexar Arquivo</span>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {(!task.anexos || task.anexos.length === 0) ? (
            <p className="text-xs text-slate-500">Nenhum arquivo anexado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.anexos.map(att => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div className="min-w-0 flex-1 truncate pr-2">
                    <span className="font-medium text-slate-200 block truncate">{att.nome}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {att.tamanho} · {att.data} por {att.autorNome || 'Equipe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {att.dataUrl && (
                      <a
                        href={att.dataUrl}
                        download={att.nome}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        title="Baixar arquivo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Remover anexo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat da Tarefa (Section 24) */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span>💬 Conversa da Tarefa</span>
              <span className="text-[10px] text-slate-500">
                (Histórico preservado na demanda)
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {task.comentarios?.length || 0} mensagens
            </span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {(!task.comentarios || task.comentarios.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Nenhuma mensagem nesta tarefa ainda. Envie um recado abaixo!
              </p>
            ) : (
              task.comentarios.map(c => {
                const isMe = c.autorId === currentUser.id;
                return (
                  <div
                    key={c.id}
                    className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <UserAvatar
                      name={c.autorNome}
                      avatarUrl={c.autorAvatar}
                      size="xs"
                    />
                    <div
                      className={`max-w-[80%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                        <span className="font-semibold">{c.autorNome}</span>
                        <span className="font-mono tabular-nums">{c.dataHora}</span>
                      </div>
                      <p>{c.texto}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={`Escrever mensagem como ${currentUser.nome}...`}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
