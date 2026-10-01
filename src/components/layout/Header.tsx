import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  Plus,
  Check,
  ChevronDown,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { User, Notificacao } from '../../types';
import { ActiveTab } from './Sidebar';
import { UserAvatar } from '../common/UserAvatar';
import { isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabase';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: User;
  users: User[];
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  onOpenNewTaskModal: () => void;
  notificacoes: Notificacao[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  users,
  onSwitchUser,
  onLogout,
  theme,
  onToggleTheme,
  onOpenMobileSidebar,
  onOpenNewTaskModal,
  notificacoes,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectTab
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      testSupabaseConnection()
        .then(res => setSupabaseConnected(res.connected))
        .catch(() => setSupabaseConnected(false));
    } else {
      setSupabaseConnected(null);
    }
  }, []);

  const unreadNotifs = notificacoes.filter(n => !n.lida);

  const sectionTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    inicio: { title: 'Visão Geral', subtitle: 'Painel operacional da equipe' },
    tarefas: { title: 'Tarefas', subtitle: 'Acompanhamento e exportação Excel' },
    condominios: { title: 'Condomínios', subtitle: '54 condomínios cadastrados' },
    balancetes: { title: 'Balancetes', subtitle: 'Checklists de conciliação e envio' },
    boletos: { title: 'Boletos', subtitle: 'Emissão e conferência' },
    xerox: { title: 'Xerox', subtitle: 'Controle de cópias e custos' },
    assembleias: { title: 'Assembleias', subtitle: 'Editais e calendário' },
    chat: { title: 'Chat Geral', subtitle: 'Comunicação interna em tempo real' },
    indicadores: { title: 'Indicadores', subtitle: 'Métricas de produtividade e processos' },
    historico: { title: 'Histórico & Auditoria', subtitle: 'Registro detalhado de ações' },
    configuracoes: { title: 'Configurações', subtitle: 'Usuários, logo, integrações e backup' }
  };

  const currentMeta = sectionTitles[activeTab] || { title: 'PULSO95', subtitle: 'Gestão de processos' };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#070B18]/90 dark:bg-[#070B18]/90 light:bg-white/90 backdrop-blur-md border-b border-[#1E293B] dark:border-[#1E293B] light:border-slate-200">
      {/* Zone 1: Mobile Toggle & Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 lg:hidden"
          title="Menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              {currentMeta.title}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">·</span>
            <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 hidden sm:inline">
              {currentMeta.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2 & 3: Actions & User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Connection Status Badge */}
        {supabaseConnected !== null && (
          <button
            type="button"
            onClick={() => onSelectTab('configuracoes')}
            title={
              supabaseConnected
                ? '🟢 Supabase conectado — Clique para abrir diagnósticos'
                : '🔴 Supabase não conectado — Clique para configurar'
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              supabaseConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{supabaseConnected ? '🟢 Supabase conectado' : '🔴 Supabase não conectado'}</span>
          </button>
        )}

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-sm shadow-blue-600/30 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova tarefa</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#070B18]" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white dark:text-white light:text-slate-900">
                    Notificações
                  </span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-400 rounded">
                      {unreadNotifs.length} novas
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Marcar todas lidas
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notificacoes.slice(0, 8).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.linkTab) {
                          onSelectTab(n.linkTab as ActiveTab);
                          setShowNotifDropdown(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.lida ? 'bg-blue-600/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!n.lida && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-white dark:text-white light:text-slate-900">
                            {n.titulo}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 tabular-nums font-mono">
                          {n.criadaEm}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-1 leading-relaxed">
                        {n.descricao}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pending Users Approval Alert (Master only) */}
        {currentUser.role === 'master' && users.some(u => u.status === 'pendente') && (
          <button
            type="button"
            onClick={() => onSelectTab('configuracoes')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors animate-pulse"
            title="Clique para ir para Usuários e aprovar novas contas"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Aprovar contas:</span>
            <span>{users.filter(u => u.status === 'pendente').length}</span>
          </button>
        )}

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
          title={theme === 'dark' ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Switcher Dropdown (Section 5) */}
        <div className="relative pl-1 border-l border-slate-800 dark:border-slate-800 light:border-slate-200" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors text-left"
          >
            <UserAvatar
              name={currentUser.nome}
              avatarUrl={currentUser.avatar}
              size="sm"
            />
            <div className="hidden md:block">
              <span className="text-xs font-bold text-white dark:text-white light:text-slate-900 block leading-tight">
                {currentUser.nome}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 block">
                {currentUser.cargo}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] dark:border-[#1E293B] light:border-slate-200 shadow-2xl p-1.5 z-50">
              <div className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 mb-1">
                Alternar Usuário Atual
              </div>
              {users.filter(u => u.status === 'ativo').map(u => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-white font-semibold'
                        : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={u.nome}
                        avatarUrl={u.avatar}
                        size="xs"
                      />
                      <div className="text-left">
                        <span className="block font-medium">{u.nome}</span>
                        <span className="text-[10px] text-slate-400">{u.cargo}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
              <div className="mt-1 pt-1.5 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da conta (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
