import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { TaskModal } from './components/tasks/TaskModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TarefasView } from './views/TarefasView';
import { CondominiosView } from './views/CondominiosView';
import { ProcessosView } from './views/ProcessosView';
import { XeroxView } from './views/XeroxView';
import { AssembleiasView } from './views/AssembleiasView';
import { ChatView } from './views/ChatView';
import { IndicadoresView } from './views/IndicadoresView';
import { HistoricoView } from './views/HistoricoView';
import { ConfiguracoesView } from './views/ConfiguracoesView';
import { AuthView } from './views/AuthView';
import { PendingApprovalView } from './views/PendingApprovalView';
import { BlockedUserView } from './views/BlockedUserView';

// Services & Types
import {
  AuthService,
  ProfileService,
  CondominioService,
  TarefaService,
  BalanceteService,
  BoletoService,
  XeroxService,
  AssembleiaService,
  MensagemService,
  NotificacaoService,
  LogService,
  ConfiguracaoService,
  StorageService
} from './services';
import { HistoryService } from './services/historyService';
import { DiscordService } from './services/discordService';
import { isSupabaseConfigured, testSupabaseConnection, getSupabaseClient } from './lib/supabase';
import {
  User,
  Condominio,
  Tarefa,
  PeriodoProcesso,
  ProcessoCard,
  XeroxRegistro,
  Assembleia,
  ChatMessage,
  Notificacao,
  IdentidadeConfig,
  HistoricoItem
} from './types';

export default function App() {
  // Initialize storage
  useEffect(() => {
    StorageService.init();
  }, []);

  // Theme
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => StorageService.getTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    StorageService.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State
  const [sessionActive, setSessionActive] = useState<boolean>(() => StorageService.isSessionActive());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [condominios, setCondominios] = useState<Condominio[]>(() => StorageService.getCondominios());
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => StorageService.getTarefas());
  const [balancetePeriodos, setBalancetePeriodos] = useState<PeriodoProcesso[]>(() =>
    StorageService.getPeriodos('balancete')
  );
  const [balanceteCards, setBalanceteCards] = useState<ProcessoCard[]>(() =>
    StorageService.getProcessoCards('balancete')
  );
  const [boletoPeriodos, setBoletoPeriodos] = useState<PeriodoProcesso[]>(() =>
    StorageService.getPeriodos('boleto')
  );
  const [boletoCards, setBoletoCards] = useState<ProcessoCard[]>(() =>
    StorageService.getProcessoCards('boleto')
  );
  const [xeroxList, setXeroxList] = useState<XeroxRegistro[]>(() => StorageService.getXerox());
  const [assembleias, setAssembleias] = useState<Assembleia[]>(() => StorageService.getAssembleias());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatGeral());
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => StorageService.getNotificacoes());
  const [identidade, setIdentidade] = useState<IdentidadeConfig>(() => StorageService.getIdentidade());
  const [historyLogs, setHistoryLogs] = useState<HistoricoItem[]>(() => HistoryService.getLogs());

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [initialTaskFilterAssignee, setInitialTaskFilterAssignee] = useState<string>('');

  // Modals & Drawers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Tarefa | null>(null);
  const [taskDetailSelected, setTaskDetailSelected] = useState<Tarefa | null>(null);

  // Toasts (Section 58)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (tipo: 'success' | 'warning' | 'info', titulo: string, mensagem?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, tipo, titulo, mensagem }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshAllStates = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setUsers(StorageService.getUsers());
    setCondominios(StorageService.getCondominios());
    setTarefas(StorageService.getTarefas());
    setBalancetePeriodos(StorageService.getPeriodos('balancete'));
    setBalanceteCards(StorageService.getProcessoCards('balancete'));
    setBoletoPeriodos(StorageService.getPeriodos('boleto'));
    setBoletoCards(StorageService.getProcessoCards('boleto'));
    setXeroxList(StorageService.getXerox());
    setAssembleias(StorageService.getAssembleias());
    setChatMessages(StorageService.getChatGeral());
    setNotificacoes(StorageService.getNotificacoes());
    setIdentidade(StorageService.getIdentidade());
    setHistoryLogs(HistoryService.getLogs());
    setSessionActive(StorageService.isSessionActive());
  };

  // Sync and load from Supabase on start
  useEffect(() => {
    let isMounted = true;
    let unsubscribeChat: (() => void) | null = null;

    // Listen to Supabase Auth state changes
    const authSub = AuthService.onAuthStateChange((sbUser) => {
      if (!isMounted) return;
      if (sbUser) {
        setCurrentUser(sbUser);
        setSessionActive(true);
      }
    });

    async function loadFromSupabase() {
      if (!isSupabaseConfigured()) return;
      try {
        const test = await testSupabaseConnection();
        if (!test.connected) return;

        // 0. Verify if active Supabase Auth session exists
        const sbClient = getSupabaseClient();
        if (sbClient) {
          const { data: sessionData } = await sbClient.auth.getSession();
          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            const profile = await ProfileService.getProfileById(user.id);
            if (profile && isMounted) {
              setCurrentUser(profile);
              setSessionActive(true);
            }
          }
        }

        // 1. Profiles
        const sbUsers = await ProfileService.getProfiles();
        if (isMounted && sbUsers.length > 0) setUsers(sbUsers);

        // 2. Condominios
        const sbCondos = await CondominioService.getCondominios();
        if (isMounted && sbCondos.length > 0) setCondominios(sbCondos);

        // 3. Tarefas
        const sbTarefas = await TarefaService.getTarefas();
        if (isMounted && sbTarefas.length > 0) setTarefas(sbTarefas);

        // 4. Balancetes
        const sbBalCards = await BalanceteService.getBalancetes();
        if (isMounted && sbBalCards.length > 0) setBalanceteCards(sbBalCards);

        // 5. Boletos
        const sbBolCards = await BoletoService.getBoletos();
        if (isMounted && sbBolCards.length > 0) setBoletoCards(sbBolCards);

        // 6. Xerox
        const sbXerox = await XeroxService.getXeroxRegistros();
        if (isMounted && sbXerox.length > 0) setXeroxList(sbXerox);

        // 7. Assembleias
        const sbAssembleias = await AssembleiaService.getAssembleias();
        if (isMounted && sbAssembleias.length > 0) setAssembleias(sbAssembleias);

        // 8. Mensagens Chat
        const sbChat = await MensagemService.getMensagens();
        if (isMounted && sbChat.length > 0) setChatMessages(sbChat);

        // 9. Notificacoes
        const sbNotifs = await NotificacaoService.getNotificacoes();
        if (isMounted && sbNotifs.length > 0) setNotificacoes(sbNotifs);

        // 10. Logs
        const sbLogs = await LogService.getLogs();
        if (isMounted && sbLogs.length > 0) setHistoryLogs(sbLogs);

        // 11. Real-time chat subscription
        const sub = MensagemService.subscribeToMensagens((newMsg) => {
          if (isMounted) {
            setChatMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        });
        unsubscribeChat = sub.unsubscribe;
      } catch (err) {
        console.warn('Supabase startup query notice:', err);
      }
    }

    loadFromSupabase();

    return () => {
      isMounted = false;
      authSub.unsubscribe();
      if (unsubscribeChat) {
        unsubscribeChat();
      }
    };
  }, []);

  // Switch User (Section 5)
  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUserId(userId);
    const updated = StorageService.getCurrentUser();
    setCurrentUser(updated);
    addToast('info', `Usuário ativo: ${updated.nome}`, `Perfil e permissões atualizados para ${updated.cargo}.`);
  };

  // Tasks handlers
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Tarefa) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    let res;
    if (taskData.id) {
      res = await TarefaService.updateTarefa(taskData.id, taskData);
    } else {
      res = await TarefaService.createTarefa(taskData);
    }

    if (!res.success) {
      addToast('warning', 'Falha ao salvar tarefa no Supabase', res.error || 'Verifique sua conexão ou permissões (RLS).');
      return;
    }

    const freshTarefas = StorageService.getTarefas();
    setTarefas(freshTarefas);

    const saved = res.data || taskData;
    if (taskDetailSelected && taskDetailSelected.id === saved.id) {
      setTaskDetailSelected(saved);
    }

    LogService.createLog(currentUser.nome, currentUser.id, 'Tarefas', taskData.id ? 'Atualizou tarefa' : 'Criou tarefa', saved.titulo).catch(() => {});

    addToast(
      'success',
      taskData.id ? 'Tarefa atualizada.' : 'Tarefa criada com sucesso.',
      `${saved.condominioNome || 'Condomínio'} — ${saved.titulo}`
    );

    // Discord message preparation (Section 46)
    DiscordService.notifyNewTaskAsync(saved, currentUser.nome).then(discordRes => {
      if (discordRes.success && discordRes.message) {
        addToast('info', 'Discord Webhook', discordRes.message);
      } else if (!discordRes.success && discordRes.error) {
        console.warn('Falha na notificação do Discord:', discordRes.error);
      }
    }).catch(err => {
      console.error('Erro na chamada async do Discord:', err);
    });
  };

  const handleToggleConcluirTarefa = async (id: string) => {
    const updated = await TarefaService.toggleConcluirTarefa(id);
    if (updated) {
      const freshTarefas = StorageService.getTarefas();
      setTarefas(freshTarefas);
      if (taskDetailSelected && taskDetailSelected.id === id) {
        setTaskDetailSelected({ ...updated });
      }
      LogService.createLog(currentUser.nome, currentUser.id, 'Tarefas', updated.status === 'Concluída' ? 'Concluiu tarefa' : 'Reabriu tarefa', updated.titulo).catch(() => {});
      addToast(
        updated.status === 'Concluída' ? 'success' : 'info',
        updated.status === 'Concluída' ? 'Tarefa concluída.' : 'Tarefa reaberta.',
        `${updated.condominioNome} — ${updated.titulo}`
      );
    } else {
      addToast('warning', 'Falha ao alternar status da tarefa no Supabase.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await TarefaService.deleteTarefa(id);
    if (!res.success) {
      addToast('warning', 'Falha ao excluir tarefa no Supabase', res.error);
      return;
    }
    const freshTarefas = StorageService.getTarefas();
    setTarefas(freshTarefas);
    if (taskDetailSelected && taskDetailSelected.id === id) {
      setTaskDetailSelected(null);
    }
    LogService.createLog(currentUser.nome, currentUser.id, 'Tarefas', 'Excluiu tarefa', id).catch(() => {});
    addToast('success', 'Tarefa excluída.');
  };

  const handleUpdateTask = async (task: Tarefa) => {
    await TarefaService.updateTarefa(task.id, task);
    const freshTarefas = StorageService.getTarefas();
    setTarefas(freshTarefas);
    setTaskDetailSelected(task);
  };

  const handleAddTaskComment = async (taskId: string, commentText: string) => {
    await TarefaService.addMessage(taskId, commentText, currentUser);
    const freshTarefas = StorageService.getTarefas();
    setTarefas(freshTarefas);
    const updated = freshTarefas.find(t => t.id === taskId);
    if (updated) {
      setTaskDetailSelected(updated);
    }
  };

  // Condominios handlers
  const handleSaveCondominio = async (condoData: any) => {
    let res;
    if (condoData.id) {
      res = await CondominioService.updateCondominio(condoData.id, condoData);
    } else {
      res = await CondominioService.createCondominio(condoData);
    }

    if (!res.success) {
      addToast('warning', 'Falha ao salvar condomínio no Supabase', res.error || 'Verifique sua conexão ou permissões (RLS).');
      return;
    }

    const freshCondos = StorageService.getCondominios();
    setCondominios(freshCondos);

    const saved = res.data || condoData;
    LogService.createLog(currentUser.nome, currentUser.id, 'Condomínios', condoData.id ? 'Atualizou condomínio' : 'Criou condomínio', saved.nome).catch(() => {});
    addToast('success', condoData.id ? 'Condomínio atualizado.' : 'Condomínio cadastrado com sucesso.', `${saved.nome} sincronizado com o Supabase.`);
  };

  const handleDeleteCondominio = async (id: string) => {
    const res = await CondominioService.deleteCondominio(id);
    if (!res.success) {
      addToast('warning', 'Falha ao excluir condomínio no Supabase', res.error);
      return;
    }

    const freshCondos = StorageService.getCondominios();
    setCondominios(freshCondos);
    LogService.createLog(currentUser.nome, currentUser.id, 'Condomínios', 'Excluiu condomínio', id).catch(() => {});
    addToast('success', 'Condomínio removido com sucesso.');
  };

  // Balancetes & Boletos handlers
  const handleCreatePeriodo = (tipo: 'balancete' | 'boleto', mes: string, ano: string, condoIds: string[]) => {
    StorageService.createNovoPeriodo(tipo, mes, ano, condoIds);
    refreshAllStates();
  };

  const handleToggleChecklist = async (tipo: 'balancete' | 'boleto', cardId: string, checkId: string) => {
    if (tipo === 'balancete') {
      await BalanceteService.toggleStep(cardId, checkId);
      setBalanceteCards(StorageService.getProcessoCards('balancete'));
    } else {
      await BoletoService.toggleStep(cardId, checkId);
      setBoletoCards(StorageService.getProcessoCards('boleto'));
    }
    addToast('info', 'Checklist atualizado.');
  };

  const handleUpdateCardInfo = async (tipo: 'balancete' | 'boleto', cardId: string, info: string) => {
    StorageService.updateCardInfo(tipo, cardId, info);
    if (tipo === 'balancete') {
      await BalanceteService.updateBalancete(cardId, { informacoesAdicionais: info });
      setBalanceteCards(StorageService.getProcessoCards('balancete'));
    } else {
      await BoletoService.updateBoleto(cardId, { informacoesAdicionais: info });
      setBoletoCards(StorageService.getProcessoCards('boleto'));
    }
  };

  const handleUpdateCardResponsavel = async (tipo: 'balancete' | 'boleto', cardId: string, respId: string, respNome: string) => {
    StorageService.updateCardResponsavel(tipo, cardId, respId, respNome);
    if (tipo === 'balancete') {
      await BalanceteService.updateBalancete(cardId, { responsavelId: respId, responsavelNome: respNome });
      setBalanceteCards(StorageService.getProcessoCards('balancete'));
    } else {
      await BoletoService.updateBoleto(cardId, { responsavelId: respId, responsavelNome: respNome });
      setBoletoCards(StorageService.getProcessoCards('boleto'));
    }
    addToast('success', 'Responsável atualizado.', `Novo responsável: ${respNome}`);
  };

  // Xerox handlers
  const handleSaveXerox = async (registro: any) => {
    const res = await XeroxService.createXeroxRegistro(registro);
    if (!res.success) {
      addToast('warning', 'Falha ao salvar Xerox no Supabase', res.error);
      return;
    }
    setXeroxList(StorageService.getXerox());
    const saved = res.data || registro;
    LogService.createLog(currentUser.nome, currentUser.id, 'Xerox', 'Registrou xerox', saved.condominioNome).catch(() => {});
    addToast('success', 'Registro de Xerox salvo.');
  };

  const handleDeleteXerox = async (id: string) => {
    const res = await XeroxService.deleteXeroxRegistro(id);
    if (!res.success) {
      addToast('warning', 'Falha ao remover Xerox no Supabase', res.error);
      return;
    }
    setXeroxList(StorageService.getXerox());
    addToast('success', 'Registro de Xerox removido.');
  };

  // Assembleias handlers
  const handleSaveAssembleia = async (data: any) => {
    let res;
    if (data.id) {
      res = await AssembleiaService.updateAssembleia(data.id, data);
    } else {
      res = await AssembleiaService.createAssembleia(data);
    }
    if (!res.success) {
      addToast('warning', 'Falha ao salvar assembleia no Supabase', res.error);
      return;
    }
    setAssembleias(StorageService.getAssembleias());
    const saved = res.data || data;
    LogService.createLog(currentUser.nome, currentUser.id, 'Assembleias', data.id ? 'Atualizou assembleia' : 'Criou assembleia', saved.condominioNome).catch(() => {});
    addToast('success', data.id ? 'Assembleia atualizada.' : 'Assembleia agendada com sucesso.');
  };

  const handleDeleteAssembleia = async (id: string) => {
    const res = await AssembleiaService.deleteAssembleia(id);
    if (!res.success) {
      addToast('warning', 'Falha ao excluir assembleia no Supabase', res.error);
      return;
    }
    setAssembleias(StorageService.getAssembleias());
    addToast('success', 'Assembleia excluída.');
  };

  // Chat handlers
  const handleSendChatMessage = async (texto: string) => {
    const newMsg = await MensagemService.sendMensagem(texto, currentUser);
    setChatMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  };

  // Notifications
  const handleMarkNotificationRead = async (id: string) => {
    await NotificacaoService.markAsRead(id);
    setNotificacoes(StorageService.getNotificacoes());
  };

  const handleMarkAllNotificationsRead = async () => {
    await NotificacaoService.markAllAsRead();
    setNotificacoes(StorageService.getNotificacoes());
    addToast('info', 'Todas notificações marcadas como lidas');
  };


  // Users management
  const handleSaveUser = (userData: any) => {
    const saved = StorageService.saveUser(userData);
    refreshAllStates();
    ProfileService.saveProfile(saved).catch(err => console.warn('Supabase save user:', err));
  };

  const handleDeleteUser = (id: string) => {
    const ok = StorageService.deleteUser(id);
    if (ok) {
      refreshAllStates();
      ProfileService.deleteProfile(id).catch(err => console.warn('Supabase delete user:', err));
      addToast('success', 'Usuário excluído.');
    } else {
      addToast('warning', 'Não é permitido excluir o usuário Master.');
    }
  };

  const handleUpdateUserAvatar = (userId: string, avatarBase64: string) => {
    StorageService.updateUserAvatar(userId, avatarBase64);
    refreshAllStates();
    addToast('success', 'Avatar atualizado.');
  };

  // Identidade & Logo
  const handleSaveIdentidade = (config: IdentidadeConfig) => {
    StorageService.saveIdentidade(config);
    ConfiguracaoService.setConfiguracao('identidade', config, 'identidade', 'Identidade visual do sistema').catch(() => {});
    refreshAllStates();
  };

  const handleUpdateLogo = (logoBase64: string) => {
    StorageService.updateLogo(logoBase64);
    refreshAllStates();
  };

  // Reset Demo Data (Section 54)
  const handleResetData = () => {
    StorageService.resetAllData();
    refreshAllStates();
    addToast('success', 'Dados de teste restaurados com sucesso.');
  };

  const handleLogout = () => {
    AuthService.signOut().catch(() => {});
    StorageService.logout();
    setSessionActive(false);
    addToast('info', 'Sessão encerrada com sucesso.');
  };

  const unreadChatCount = chatMessages.length > 0 ? 1 : 0;
  const openTasksCount = tarefas.filter(t => t.status !== 'Concluída').length;

  // 1. Not logged in -> Show Auth View
  if (!sessionActive || !currentUser) {
    return (
      <div className={theme}>
        <AuthView
          identidade={identidade}
          onLoginSuccess={user => {
            setCurrentUser(user);
            setSessionActive(true);
            refreshAllStates();
          }}
          onToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // 2. Pending approval -> Show Pending Screen (Requirement)
  if (currentUser.status === 'pendente') {
    return (
      <div className={theme}>
        <PendingApprovalView
          user={currentUser}
          identidade={identidade}
          onRefreshStatus={() => {
            const fresh = StorageService.getUserById(currentUser.id);
            if (fresh) {
              setCurrentUser(fresh);
              if (fresh.status === 'ativo') {
                addToast('success', 'Acesso aprovado!', 'Você agora tem permissão para navegar no PULSO95.');
              } else {
                addToast('info', 'Status: Pendente', 'Sua conta ainda está aguardando aprovação do administrador.');
              }
            }
            refreshAllStates();
          }}
          onLogout={() => {
            StorageService.logout();
            setSessionActive(false);
            addToast('info', 'Sessão encerrada.');
          }}
          onSwitchToMaster={() => {
            const master = StorageService.getUsers().find(u => u.role === 'master') || StorageService.getUsers()[0];
            StorageService.setCurrentUserId(master.id);
            StorageService.setSessionActive(true);
            setCurrentUser(master);
            refreshAllStates();
            addToast('success', 'Conectado como Fabrício (Master)', 'Vá em Configurações → Usuários para aprovar o colaborador.');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // 3. Blocked account -> Show Blocked Screen
  if (currentUser.status === 'bloqueado') {
    return (
      <div className={theme}>
        <BlockedUserView
          user={currentUser}
          identidade={identidade}
          onLogout={() => {
            StorageService.logout();
            setSessionActive(false);
          }}
          onSwitchToMaster={() => {
            const master = StorageService.getUsers().find(u => u.role === 'master') || StorageService.getUsers()[0];
            StorageService.setCurrentUserId(master.id);
            StorageService.setSessionActive(true);
            setCurrentUser(master);
            refreshAllStates();
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#070B18] text-[#F8FAFC]'
          : 'bg-[#F5F7FB] text-[#111827]'
      }`}
    >
      {/* Toast Feedback (Section 58) */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Responsive Sidebar (Section 4) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={tab => {
          setActiveTab(tab);
          setInitialTaskFilterAssignee('');
        }}
        currentUser={currentUser}
        identidade={identidade}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        unreadChatCount={unreadChatCount}
        openTasksCount={openTasksCount}
      />

      {/* Main Viewport Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header with User Switcher & Notifications */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onOpenNewTaskModal={handleOpenNewTask}
          notificacoes={notificacoes}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectTab={setActiveTab}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'inicio' && (
            <DashboardView
              currentUser={currentUser}
              users={users}
              tarefas={tarefas}
              balanceteCards={balanceteCards}
              boletoCards={boletoCards}
              assembleias={assembleias}
              historyLogs={historyLogs}
              onSelectTab={setActiveTab}
              onOpenTaskModal={handleOpenNewTask}
              onOpenTaskDetail={task => setTaskDetailSelected(task)}
              onFilterTasksByAssignee={name => {
                setInitialTaskFilterAssignee(name);
                setActiveTab('tarefas');
              }}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {activeTab === 'tarefas' && (
            <TarefasView
              tarefas={tarefas}
              condominios={condominios}
              users={users}
              currentUser={currentUser}
              onOpenNewTaskModal={handleOpenNewTask}
              onOpenTaskDetail={task => setTaskDetailSelected(task)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleConcluir={handleToggleConcluirTarefa}
              initialFilterAssignee={initialTaskFilterAssignee}
              onToast={addToast}
            />
          )}

          {activeTab === 'condominios' && (
            <CondominiosView
              condominios={condominios}
              users={users}
              onSaveCondominio={handleSaveCondominio}
              onDeleteCondominio={handleDeleteCondominio}
              onToast={addToast}
            />
          )}

          {activeTab === 'balancetes' && (
            <ProcessosView
              tipo="balancete"
              periodos={balancetePeriodos}
              cards={balanceteCards}
              condominios={condominios}
              users={users}
              currentUser={currentUser}
              onCreatePeriodo={(mes, ano, condoIds) =>
                handleCreatePeriodo('balancete', mes, ano, condoIds)
              }
              onToggleChecklist={(cardId, checkId) =>
                handleToggleChecklist('balancete', cardId, checkId)
              }
              onUpdateCardInfo={(cardId, info) =>
                handleUpdateCardInfo('balancete', cardId, info)
              }
              onUpdateCardResponsavel={(cardId, respId, respNome) =>
                handleUpdateCardResponsavel('balancete', cardId, respId, respNome)
              }
              onAddCommentCard={(cardId, text) => {
                StorageService.addComentarioCard('balancete', cardId, text);
                refreshAllStates();
              }}
              onToast={addToast}
            />
          )}

          {activeTab === 'boletos' && (
            <ProcessosView
              tipo="boleto"
              periodos={boletoPeriodos}
              cards={boletoCards}
              condominios={condominios}
              users={users}
              currentUser={currentUser}
              onCreatePeriodo={(mes, ano, condoIds) =>
                handleCreatePeriodo('boleto', mes, ano, condoIds)
              }
              onToggleChecklist={(cardId, checkId) =>
                handleToggleChecklist('boleto', cardId, checkId)
              }
              onUpdateCardInfo={(cardId, info) =>
                handleUpdateCardInfo('boleto', cardId, info)
              }
              onUpdateCardResponsavel={(cardId, respId, respNome) =>
                handleUpdateCardResponsavel('boleto', cardId, respId, respNome)
              }
              onAddCommentCard={(cardId, text) => {
                StorageService.addComentarioCard('boleto', cardId, text);
                refreshAllStates();
              }}
              onToast={addToast}
            />
          )}

          {activeTab === 'xerox' && (
            <XeroxView
              xeroxList={xeroxList}
              condominios={condominios}
              currentUser={currentUser}
              identidade={identidade}
              onSaveXerox={handleSaveXerox}
              onDeleteXerox={handleDeleteXerox}
              onToast={addToast}
            />
          )}

          {activeTab === 'assembleias' && (
            <AssembleiasView
              assembleias={assembleias}
              condominios={condominios}
              currentUser={currentUser}
              onSaveAssembleia={handleSaveAssembleia}
              onDeleteAssembleia={handleDeleteAssembleia}
              onToast={addToast}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              messages={chatMessages}
              currentUser={currentUser}
              users={users}
              onSendMessage={handleSendChatMessage}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {activeTab === 'indicadores' && (
            <IndicadoresView
              tarefas={tarefas}
              balanceteCards={balanceteCards}
              boletoCards={boletoCards}
              condominios={condominios}
              users={users}
              xeroxList={xeroxList}
            />
          )}

          {activeTab === 'historico' && (
            <HistoricoView
              logs={historyLogs}
              onClearLogs={() => {
                HistoryService.clearLogs();
                setHistoryLogs([]);
              }}
              onToast={addToast}
            />
          )}

          {activeTab === 'configuracoes' && (
            <ConfiguracoesView
              currentUser={currentUser}
              users={users}
              identidade={identidade}
              onSaveIdentidade={handleSaveIdentidade}
              onUpdateLogo={handleUpdateLogo}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUserAvatar={handleUpdateUserAvatar}
              onResetData={handleResetData}
              theme={theme}
              onToggleTheme={toggleTheme}
              onToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        condominios={condominios}
        users={users}
        currentUser={currentUser}
        taskToEdit={taskToEdit}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!taskDetailSelected}
        onClose={() => setTaskDetailSelected(null)}
        task={taskDetailSelected}
        currentUser={currentUser}
        onToggleConcluir={handleToggleConcluirTarefa}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onAddComment={handleAddTaskComment}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
