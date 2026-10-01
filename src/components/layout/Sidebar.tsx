import React from 'react';
import {
  Home,
  CheckSquare,
  Building2,
  PieChart,
  Receipt,
  Printer,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Settings,
  X,
  History
} from 'lucide-react';
import { User, IdentidadeConfig } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export type ActiveTab =
  | 'inicio'
  | 'tarefas'
  | 'condominios'
  | 'balancetes'
  | 'boletos'
  | 'xerox'
  | 'assembleias'
  | 'chat'
  | 'indicadores'
  | 'configuracoes'
  | 'historico';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User;
  identidade: IdentidadeConfig;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadChatCount?: number;
  openTasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  identidade,
  isOpenMobile,
  onCloseMobile,
  unreadChatCount = 0,
  openTasksCount = 0
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inicio', label: 'Início', icon: <Home className="w-4 h-4" /> },
    { id: 'tarefas', label: 'Tarefas', icon: <CheckSquare className="w-4 h-4" />, badge: openTasksCount },
    { id: 'condominios', label: 'Condomínios', icon: <Building2 className="w-4 h-4" /> },
    { id: 'balancetes', label: 'Balancetes', icon: <PieChart className="w-4 h-4" /> },
    { id: 'boletos', label: 'Boletos', icon: <Receipt className="w-4 h-4" /> },
    { id: 'xerox', label: 'Xerox', icon: <Printer className="w-4 h-4" /> },
    { id: 'assembleias', label: 'Assembleias', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" />, badge: unreadChatCount },
    { id: 'indicadores', label: 'Indicadores', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'historico', label: 'Histórico & Logs', icon: <History className="w-4 h-4" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> }
  ];

  const isMaster = currentUser.role === 'master';
  const permitted = currentUser.permissoes?.modulosPermitidos || [
    'inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (isMaster) return true;
    return permitted.includes(item.id);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } bg-[#070B18] text-slate-200 border-r border-[#1E293B] shadow-2xl lg:shadow-none select-none`}
        style={{
          background: 'linear-gradient(180deg, #070B18 0%, #0D1326 50%, #111A3A 100%)'
        }}
      >
        {/* Top Header / Branding & Logo */}
        <div>
          <div className="px-5 py-4 border-b border-[#1E293B]/70 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo: If custom uploaded, show it. Otherwise placeholder "LOGO PULSO95" */}
              {identidade.logoUrl ? (
                <img
                  src={identidade.logoUrl}
                  alt="Logo da Empresa"
                  className="w-10 h-10 rounded-xl object-contain bg-white/5 border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/30">
                  <span className="text-[9px] font-black tracking-tighter opacity-80 leading-none">PULSO</span>
                  <span className="text-xs font-black tracking-tighter leading-none mt-0.5">95</span>
                </div>
              )}

              <div className="min-w-0">
                <span className="text-base font-extrabold tracking-tight text-white block leading-tight truncate">
                  {identidade.nomeSistema}
                </span>
                <span className="text-[10px] font-medium text-slate-400 block tracking-tight truncate">
                  {identidade.subtitulo}
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {visibleMenuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md tabular-nums ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Current User Avatar & Status (Section 4) */}
        <div className="p-3.5 border-t border-[#1E293B]/70 bg-[#070B18]/70">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <UserAvatar
              name={currentUser.nome}
              avatarUrl={currentUser.avatar}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {currentUser.nome}
              </span>
              <span className="text-[10px] text-slate-400 block truncate font-medium">
                {currentUser.cargo}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
