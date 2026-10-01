import React, { useState } from 'react';
import {
  User as UserIcon,
  Users,
  Palette,
  Printer,
  HardDrive,
  MessageSquare,
  Database,
  Upload,
  Save,
  RotateCcw,
  Trash2,
  Edit,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Shield,
  X
} from 'lucide-react';
import {
  User,
  IdentidadeConfig,
  GoogleDriveConfig,
  DiscordConfig
} from '../types';
import { UserAvatar } from '../components/common/UserAvatar';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { GoogleDriveService } from '../services/googleDriveService';
import { DiscordService } from '../services/discordService';
import { StorageService } from '../services/storageService';
import { SupabaseIntegrationCard } from '../components/common/SupabaseIntegrationCard';

interface ConfiguracoesViewProps {
  currentUser: User;
  users: User[];
  identidade: IdentidadeConfig;
  onSaveIdentidade: (config: IdentidadeConfig) => void;
  onUpdateLogo: (logoBase64: string) => void;
  onSaveUser: (userData: Omit<User, 'id'> & { id?: string }) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUserAvatar: (userId: string, avatarBase64: string) => void;
  onApproveUser?: (userId: string, role?: 'master' | 'colaborador', modulos?: string[]) => void;
  onBlockUser?: (userId: string, motivo?: string) => void;
  onReactivateUser?: (userId: string) => void;
  onResetData: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  currentUser,
  users,
  identidade,
  onSaveIdentidade,
  onUpdateLogo,
  onSaveUser,
  onDeleteUser,
  onUpdateUserAvatar,
  onApproveUser,
  onBlockUser,
  onReactivateUser,
  onResetData,
  theme,
  onToggleTheme,
  onToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'perfil' | 'usuarios' | 'identidade' | 'xerox' | 'integracoes' | 'supabase' | 'dados'
  >('perfil');

  // Integrations state
  const [driveConfig, setDriveConfig] = useState<GoogleDriveConfig>(() => GoogleDriveService.getConfig());
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig>(() => DiscordService.getConfig());

  // User modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userCargo, setUserCargo] = useState('Colaborador');
  const [userRole, setUserRole] = useState<'master' | 'colaborador'>('colaborador');
  const [userEmail, setUserEmail] = useState('');
  const [userDiscordId, setUserDiscordId] = useState('');
  const [userStatus, setUserStatus] = useState<'ativo' | 'pendente' | 'bloqueado'>('ativo');
  const [userModulos, setUserModulos] = useState<string[]>([
    'inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'
  ]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Identidade form
  const [nomeSistema, setNomeSistema] = useState(identidade.nomeSistema);
  const [subtitulo, setSubtitulo] = useState(identidade.subtitulo);
  const [corPrincipal, setCorPrincipal] = useState(identidade.corPrincipal);
  const [corSecundaria, setCorSecundaria] = useState(identidade.corSecundaria);
  const [precoPreto, setPrecoPreto] = useState(identidade.precoXeroxPreto.toString());
  const [precoColorida, setPrecoColorida] = useState(identidade.precoXeroxColorida.toString());

  // Google Drive form
  const [driveEmail, setDriveEmail] = useState(driveConfig.emailConta);
  const [drivePasta, setDrivePasta] = useState(driveConfig.pastaPrincipal);

  // Discord form
  const [discordWebhook, setDiscordWebhook] = useState(discordConfig.webhookUrl);
  const [discordServidor, setDiscordServidor] = useState(discordConfig.servidor);
  const [discordCanal, setDiscordCanal] = useState(discordConfig.canal);

  // Logo file upload (Section 7)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      onUpdateLogo(b64);
      onToast('success', 'Logo atualizada com sucesso.');
    };
    reader.readAsDataURL(file);
  };

  // Avatar file upload (Section 6)
  const handleAvatarUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      onUpdateUserAvatar(userId, b64);
      onToast('success', 'Foto de perfil atualizada.');
    };
    reader.readAsDataURL(file);
  };

  // Save Identidade
  const handleSaveIdentidadeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIdentidade({
      ...identidade,
      nomeSistema: nomeSistema.trim(),
      subtitulo: subtitulo.trim(),
      corPrincipal,
      corSecundaria,
      temaPadrao: theme,
      precoXeroxPreto: parseFloat(precoPreto) || 0.20,
      precoXeroxColorida: parseFloat(precoColorida) || 1.00
    });
    onToast('success', 'Identidade visual e valores salvos.');
  };

  // Save User

    const handleSaveUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      onSaveUser({
        id: editingUser?.id,
        nome: userName.trim(),
        cargo: userCargo.trim(),
        role: userRole,
        email: userEmail.trim() || `${userName.toLowerCase().replace(/\s+/g, '')}@pulso95.com.br`,
        discordId: userDiscordId.trim() || undefined,
        status: userStatus,
        permissoes: {
          modulosPermitidos: userRole === 'master'
            ? ['inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores', 'historico', 'configuracoes']
            : userModulos,
          podeCriarTarefas: true,
          podeEditarCondominios: userRole === 'master',
          podeGerenciarXerox: true,
          podeGerenciarAssembleias: userRole === 'master'
        }
      });

      setIsUserModalOpen(false);
      onToast(
        'success',
        editingUser
          ? 'Usuário atualizado com sucesso.'
          : 'Novo usuário adicionado com sucesso.'
      );
    };



  // Google Drive Connect (Section 41 & 42)
  const handleConnectDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const res = GoogleDriveService.connect(driveEmail, drivePasta);
    setDriveConfig(res.config);
    onToast('info', 'Google Drive', res.message);
  };

  const handleDisconnectDrive = () => {
    const res = GoogleDriveService.disconnect();
    setDriveConfig(res);
    onToast('info', 'Google Drive desconectado');
  };

  // Discord Save & Test (Section 44, 45, 47)
  const handleSaveDiscord = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DiscordConfig = {
      conectado: !!discordWebhook.trim(),
      webhookUrl: discordWebhook.trim(),
      servidor: discordServidor.trim(),
      canal: discordCanal.trim(),
      statusTexto: discordWebhook.trim() ? '🟢 Conectado (Webhook Ativo)' : '🔴 Não conectado'
    };
    DiscordService.saveConfig(updated);
    setDiscordConfig(updated);
    onToast('success', 'Configuração do Discord salva.');
  };

  const handleTestDiscord = () => {
    const res = DiscordService.testConnection();
    onToast(res.success ? 'success' : 'warning', 'Teste de Conexão Discord', res.message);
  };

  // Backup JSON (Section 56)
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PULSO95_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('success', 'Backup exportado com sucesso.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = StorageService.importFullBackupJson(content);
      if (success) {
        onToast('success', 'Backup importado com sucesso! Recarregando sistema...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        onToast('warning', 'Erro ao ler arquivo de backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const isMaster = currentUser.role === 'master';

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Top Navigation Subtabs (Section 52) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          { id: 'perfil', label: 'Meu Perfil', icon: <UserIcon className="w-3.5 h-3.5" /> },
          { id: 'usuarios', label: 'Usuários & Equipe', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'identidade', label: 'Identidade Visual & Logo', icon: <Palette className="w-3.5 h-3.5" /> },
          { id: 'xerox', label: 'Valores de Xerox', icon: <Printer className="w-3.5 h-3.5" /> },
          { id: 'integracoes', label: 'Integrações', icon: <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: 'supabase', label: 'Supabase (Banco de Dados)', icon: <Database className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: 'dados', label: 'Dados & Backup', icon: <Database className="w-3.5 h-3.5" /> }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab: Meu Perfil (Section 6 & 52) */}
      {activeSubTab === 'perfil' && (
        <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <UserAvatar name={currentUser.nome} avatarUrl={currentUser.avatar} size="lg" />
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                {currentUser.nome}
              </h3>
              <span className="text-xs text-slate-400 font-medium">{currentUser.cargo} · {currentUser.email}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Foto de Perfil do Usuário (Avatar)
            </label>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carregue uma foto em PNG, JPG, JPEG ou WEBP. A foto aparecerá no menu lateral, tarefas, checklists, mensagens de chat e atividades recentes. Se não houver foto, suas iniciais serão exibidas.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-md">
                <Upload className="w-3.5 h-3.5" />
                <span>Alterar foto</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={e => handleAvatarUpload(currentUser.id, e)}
                  className="hidden"
                />
              </label>

              {currentUser.avatar && (
                <button
                  type="button"
                  onClick={() => onUpdateUserAvatar(currentUser.id, '')}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40"
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Usuários & Equipe (Section 5, 6, 8, 52) */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-6">
          {/* Top User Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total de Usuários</span>
              <span className="text-xl font-black text-white font-mono">{users.length}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Usuários Ativos</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {users.filter(u => u.status === 'ativo').length}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm transition-all ${
              users.some(u => u.status === 'pendente')
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-[#111827] border-[#1E293B]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-amber-400 block">Aguardando Aprovação</span>
                {users.some(u => u.status === 'pendente') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-xl font-black text-amber-300 font-mono">
                {users.filter(u => u.status === 'pendente').length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Bloqueados</span>
              <span className="text-xl font-black text-slate-400 font-mono">
                {users.filter(u => u.status === 'bloqueado').length}
              </span>
            </div>
          </div>

          {/* Pending Approval Section for Master */}
          {users.filter(u => u.status === 'pendente').length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Solicitações de Cadastro Aguardando Aprovação ({users.filter(u => u.status === 'pendente').length})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Os seguintes usuários solicitaram acesso ao sistema e não podem navegar até que você aprove suas permissões:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {users.filter(u => u.status === 'pendente').map(pu => (
                  <div key={pu.id} className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={pu.nome} avatarUrl={pu.avatar} size="md" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{pu.nome}</h4>
                          <span className="text-[11px] text-slate-400 block truncate">{pu.email}</span>
                          <span className="text-[10px] text-amber-400 font-medium">{pu.cargo}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {pu.criadoEm || 'Hoje'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          if (onApproveUser) {
                            onApproveUser(pu.id, 'colaborador');
                          } else {
                            StorageService.approveUser(pu.id);
                            onSaveUser({ ...pu, status: 'ativo' });
                          }
                          onToast('success', `Acesso aprovado para ${pu.nome}!`, 'O usuário agora tem permissão para acessar os módulos.');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar Acesso</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserToDelete(pu.id)}
                        className="py-1.5 px-3 rounded-xl text-xs font-medium text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/40 transition-colors"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User List Panel */}
          <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Todos os Usuários Cadastrados</h3>
                <p className="text-xs text-slate-400">
                  Gerenciamento de membros, cargos, perfis e permissões de acesso
                </p>
              </div>

              {isMaster && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setUserName('');
                    setUserCargo('Colaborador');
                    setUserRole('colaborador');
                    setUserEmail('');
                    setUserDiscordId('');
                    setUserStatus('ativo');
                    setUserModulos([
                      'inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'
                    ]);
                    setIsUserModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Cadastrar Novo Usuário</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800/80">
              {users.map(u => {
                const isUserMaster = u.role === 'master';
                const isCurrent = u.id === currentUser.id;

                return (
                  <div key={u.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar name={u.nome} avatarUrl={u.avatar} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{u.nome}</h4>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                              Você
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isUserMaster
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {isUserMaster ? '👑 Master' : 'Colaborador'}
                          </span>

                          {/* Status Badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            u.status === 'ativo'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : u.status === 'pendente'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {u.status === 'ativo' ? 'Ativo' : u.status === 'pendente' ? 'Pendente' : 'Bloqueado'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{u.cargo}</span>
                          <span>·</span>
                          <span className="text-slate-500 truncate">{u.email}</span>
                          {u.criadoEm && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-slate-500">Cadastrado em {u.criadoEm}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Master Actions Bar */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <label className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 text-xs font-medium flex items-center gap-1 transition-colors" title="Alterar foto">
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleAvatarUpload(u.id, e)}
                          className="hidden"
                        />
                      </label>

                      {isMaster && (
                        <>
                          {/* Approve shortcut if pending */}
                          {u.status === 'pendente' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onApproveUser) {
                                  onApproveUser(u.id, 'colaborador');
                                } else {
                                  StorageService.approveUser(u.id);
                                  onSaveUser({ ...u, status: 'ativo' });
                                }
                                onToast('success', `Acesso liberado para ${u.nome}!`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1"
                              title="Aprovar usuário"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprovar</span>
                            </button>
                          )}

                          {/* Block/Reactivate toggle */}
                          {!isUserMaster && (
                            <button
                              type="button"
                              onClick={() => {
                                if (u.status === 'bloqueado') {
                                  if (onReactivateUser) onReactivateUser(u.id);
                                  else {
                                    StorageService.reactivateUser(u.id);
                                    onSaveUser({ ...u, status: 'ativo' });
                                  }
                                  onToast('info', `Usuário ${u.nome} reativado.`);
                                } else {
                                  if (onBlockUser) onBlockUser(u.id);
                                  else {
                                    StorageService.blockUser(u.id);
                                    onSaveUser({ ...u, status: 'bloqueado' });
                                  }
                                  onToast('warning', `Usuário ${u.nome} bloqueado.`);
                                }
                              }}
                              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                                u.status === 'bloqueado'
                                  ? 'text-emerald-400 hover:bg-emerald-950/40'
                                  : 'text-amber-400 hover:bg-amber-950/40'
                              }`}
                              title={u.status === 'bloqueado' ? 'Reativar usuário' : 'Bloquear usuário'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit User */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setUserName(u.nome);
                              setUserCargo(u.cargo);
                              setUserRole(u.role);
                              setUserEmail(u.email);
                              setUserDiscordId(u.discordId || '');
                              setUserStatus(u.status || 'ativo');
                              setUserModulos(
                                u.permissoes?.modulosPermitidos || [
                                  'inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'
                                ]
                              );
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Editar usuário e permissões"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          {!isUserMaster && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Identidade Visual & Logo (Section 2, 7) */}
      {activeSubTab === 'identidade' && (
        <form onSubmit={handleSaveIdentidadeSubmit} className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Identidade Visual da Plataforma</h3>
            <p className="text-xs text-slate-400">Configure o logotipo da empresa e nomes de exibição</p>
          </div>

          {/* Logo da Empresa (Section 7) */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Logo da Empresa</span>
                <span className="text-[11px] text-slate-400">
                  Carregue a imagem da logo para o menu lateral. Se não houver logo, aparecerá o placeholder [LOGO PULSO95].
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="w-24 h-16 rounded-xl bg-[#070B18] border border-slate-800 flex items-center justify-center p-2 shrink-0">
                {identidade.logoUrl ? (
                  <img src={identidade.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 text-center uppercase">
                    LOGO PULSO95
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-md">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{identidade.logoUrl ? 'Substituir logo' : '+ Adicionar logo'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                {identidade.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateLogo('');
                      onToast('info', 'Logo removida. Placeholder restaurado.');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-white bg-rose-950/20 border border-rose-900/40"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Sistema
              </label>
              <input
                type="text"
                value={nomeSistema}
                onChange={e => setNomeSistema(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                value={subtitulo}
                onChange={e => setSubtitulo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cor Principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={corPrincipal}
                  onChange={e => setCorPrincipal(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={corPrincipal}
                  onChange={e => setCorPrincipal(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={corSecundaria}
                  onChange={e => setCorSecundaria(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={corSecundaria}
                  onChange={e => setCorSecundaria(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tema da Interface</label>
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800"
              >
                <span>{theme === 'dark' ? 'Modo Escuro (Ativo)' : 'Modo Claro (Ativo)'}</span>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
            >
              Salvar Identidade Visual
            </button>
          </div>
        </form>
      )}

      {/* Subtab: Valores de Xerox (Section 35) */}
      {activeSubTab === 'xerox' && (
        <form onSubmit={handleSaveIdentidadeSubmit} className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Configuração de Valores de Xerox</h3>
            <p className="text-xs text-slate-400">
              O Master pode alterar os valores unitários a qualquer momento. Eles serão usados no cálculo automático de cópias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preto e Branco (R$ unitário)
              </label>
              <input
                type="number"
                step="0.01"
                value={precoPreto}
                onChange={e => setPrecoPreto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Valor inicial padrão: R$ 0,20</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Colorido (R$ unitário)
              </label>
              <input
                type="number"
                step="0.01"
                value={precoColorida}
                onChange={e => setPrecoColorida(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Valor inicial padrão: R$ 1,00</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
            >
              Salvar Valores de Xerox
            </button>
          </div>
        </form>
      )}

      {/* Subtab: Integrações (Supabase, Google Drive & Discord) */}
      {activeSubTab === 'integracoes' && (
        <div className="space-y-6">
          {/* Supabase Card (Banco de Dados Principal) */}
          <SupabaseIntegrationCard onToast={onToast} />

          {/* Google Drive Card (Section 40, 41, 42) */}
          <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Integração Google Drive</h3>
                  <span className="text-xs text-slate-400">{driveConfig.statusTexto}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConnectDrive} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail da Conta Google
                  </label>
                  <input
                    type="email"
                    value={driveEmail}
                    onChange={e => setDriveEmail(e.target.value)}
                    required
                    placeholder="administracao@empresa.com.br"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome da Pasta Principal
                  </label>
                  <input
                    type="text"
                    value={drivePasta}
                    onChange={e => setDrivePasta(e.target.value)}
                    required
                    placeholder="PULSO95"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-blue-200">
                Subpastas preparadas: <strong>Tarefas, Balancetes, Boletos, Assembleias</strong>.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
                >
                  Conectar Google Drive
                </button>
                {driveConfig.conectado && (
                  <button
                    type="button"
                    onClick={handleDisconnectDrive}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Discord Card (Section 43, 44, 45, 46, 47) */}
          <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Integração Discord (Avisos de Tarefas)</h3>
                  <span className="text-xs text-slate-400">{discordConfig.statusTexto}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveDiscord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Webhook URL do Discord
                </label>
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={e => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Servidor
                  </label>
                  <input
                    type="text"
                    value={discordServidor}
                    onChange={e => setDiscordServidor(e.target.value)}
                    placeholder="PULSO95 Operacional"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Canal de Notificações
                  </label>
                  <input
                    type="text"
                    value={discordCanal}
                    onChange={e => setDiscordCanal(e.target.value)}
                    placeholder="#avisos-tarefas"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Salvar Configuração do Discord
                </button>
                <button
                  type="button"
                  onClick={handleTestDiscord}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl"
                >
                  Testar Conexão
                </button>
                {discordConfig.conectado && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = DiscordService.disconnect();
                      setDiscordConfig(res);
                      setDiscordWebhook('');
                      onToast('info', 'Discord desconectado');
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtab: Supabase (Banco de Dados Principal) */}
      {activeSubTab === 'supabase' && (
        <SupabaseIntegrationCard onToast={onToast} />
      )}

      {/* Subtab: Dados & Backup (Section 54, 55, 56) */}
      {activeSubTab === 'dados' && (
        <div className="p-6 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Gestão de Dados & Backup LocalStorage</h3>
            <p className="text-xs text-slate-400">Exporte ou importe a base inteira para segurança</p>
          </div>

          {/* Export / Import */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Exportar Dados do Sistema</span>
              <p className="text-xs text-slate-400">
                Baixe um arquivo JSON contendo todas as tarefas, condomínios, checklists, Xerox e configurações.
              </p>
              <button
                onClick={handleExportBackup}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Backup Completo (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Importar Dados (Restaurar Backup)</span>
              <p className="text-xs text-slate-400">
                Selecione um arquivo JSON de backup do PULSO95 para restaurar todos os dados locais.
              </p>
              <label className="mt-2 cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Selecionar Arquivo JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset Demo Data (Section 54) */}
          <div className="pt-4 border-t border-slate-800 p-4 rounded-xl bg-rose-950/10 border border-rose-900/30 space-y-2">
            <span className="text-xs font-bold text-rose-400 block">Restaurar Dados de Teste</span>
            <p className="text-xs text-slate-400">
              Recarrega a base original com os 54 condomínios (Colonial Sul até Vinícius de Moraes) e seus responsáveis padrão, além das tarefas e balancetes fictícios iniciais.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja recarregar os dados de teste originais?')) {
                  onResetData();
                  onToast('success', 'Dados de teste restaurados com sucesso.');
                }
              }}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-900/40 hover:bg-rose-800 border border-rose-700/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Dados de Teste</span>
            </button>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        maxWidth="md"
      >
<form onSubmit={handleSaveUserSubmit} className="space-y-4">
  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-1">
      Nome Completo *
    </label>
    <input
      type="text"
      value={userName}
      onChange={e => setUserName(e.target.value)}
      required
      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
    />
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">
        Cargo *
      </label>
      <input
        type="text"
        value={userCargo}
        onChange={e => setUserCargo(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">
        Perfil de Acesso
      </label>
      <select
        value={userRole}
        onChange={e => setUserRole(e.target.value as any)}
        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
      >
        <option value="colaborador">Colaborador</option>
        <option value="master">Master (Administrador)</option>
      </select>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">
        E-mail *
      </label>
      <input
        type="email"
        required
        value={userEmail}
        onChange={e => setUserEmail(e.target.value)}
        placeholder="usuario@pulso95.com.br"
        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">
        ID do Discord
      </label>
      <input
        type="text"
        value={userDiscordId}
        onChange={e => setUserDiscordId(e.target.value)}
        placeholder="Ex.: 123456789012345678"
        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
      />
      <p className="text-[10px] text-slate-500 mt-1">
        Usado para enviar notificações de tarefas pelo Discord.
      </p>
    </div>
  </div>


  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-1">Status da Conta</label>
    <select
      value={userStatus}
      onChange={e => setUserStatus(e.target.value as any)}
      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
    >
      <option value="ativo">Ativo (Acesso liberado)</option>
      <option value="pendente">Pendente (Aguardando aprovação)</option>
      <option value="bloqueado">Bloqueado (Acesso suspenso)</option>
    </select>
  </div>

          {/* Module Permissions (Section 8, 52) */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 block">
                Módulos Permitidos no Menu Lateral
              </label>
              {userRole === 'master' && (
                <span className="text-[10px] text-indigo-400 font-bold">
                  (Master tem acesso total a todos os módulos)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'inicio', label: '🏠 Início' },
                { id: 'tarefas', label: '📋 Tarefas' },
                { id: 'condominios', label: '🏢 Condomínios' },
                { id: 'balancetes', label: '📊 Balancetes' },
                { id: 'boletos', label: '🧾 Boletos' },
                { id: 'xerox', label: '🖨️ Xerox' },
                { id: 'assembleias', label: '📅 Assembleias' },
                { id: 'chat', label: '💬 Chat Geral' },
                { id: 'indicadores', label: '📈 Indicadores' },
                { id: 'historico', label: '📜 Histórico & Logs' }
              ].map(mod => {
                const isChecked = userRole === 'master' || userModulos.includes(mod.id);

                return (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-600/10 border-blue-500/30 text-white font-medium'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={userRole === 'master'}
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) {
                          setUserModulos(prev => [...prev, mod.id]);
                        } else {
                          setUserModulos(prev => prev.filter(m => m !== mod.id));
                        }
                      }}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="truncate">{mod.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
            >
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            onDeleteUser(userToDelete);
            onToast('success', 'Usuário excluído.');
            setUserToDelete(null);
          }
        }}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este colaborador da equipe?"
      />
    </div>
  );
};
