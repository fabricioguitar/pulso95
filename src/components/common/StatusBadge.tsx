import React from 'react';
import { TaskPriority, TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = String(status || '').toLowerCase().trim();

  let config = {
    label: status,
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-400 dark:text-slate-400 light:text-slate-600',
    bgClass: 'bg-slate-500/10 border-slate-500/20'
  };

  if (normalized === 'concluída' || normalized === 'concluido' || normalized === 'concluído') {
    config = {
      label: 'Concluído',
      dotClass: 'bg-emerald-500',
      textClass: 'text-emerald-400 dark:text-emerald-400 light:text-emerald-700',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20'
    };
  } else if (normalized === 'em andamento' || normalized === 'em_andamento') {
    config = {
      label: 'Em andamento',
      dotClass: 'bg-blue-500',
      textClass: 'text-blue-400 dark:text-blue-400 light:text-blue-700',
      bgClass: 'bg-blue-500/10 border-blue-500/20'
    };
  } else if (normalized === 'atenção' || normalized === 'atencao') {
    config = {
      label: 'Atenção',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-400 dark:text-amber-400 light:text-amber-700',
      bgClass: 'bg-amber-500/10 border-amber-500/20'
    };
  } else if (normalized === 'atrasada' || normalized === 'atrasado') {
    config = {
      label: 'Atrasado',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-400 dark:text-rose-400 light:text-rose-700',
      bgClass: 'bg-rose-500/10 border-rose-500/20'
    };
  } else if (normalized === 'pendente' || normalized === 'não iniciado' || normalized === 'nao_iniciado') {
    config = {
      label: 'Pendente',
      dotClass: 'bg-slate-400',
      textClass: 'text-slate-400 dark:text-slate-400 light:text-slate-600',
      bgClass: 'bg-slate-500/10 border-slate-500/20'
    };
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${config.bgClass} ${config.textClass} ${pad}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  prioridade: TaskPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ prioridade }) => {
  const norm = String(prioridade || '').toLowerCase();
  let styles = 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  if (norm === 'baixa') {
    styles = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  } else if (norm === 'normal' || norm === 'média' || norm === 'media') {
    styles = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  } else if (norm === 'alta') {
    styles = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else if (norm === 'urgente') {
    styles = 'text-rose-400 bg-rose-500/10 border-rose-500/20 font-semibold animate-pulse';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${styles}`}>
      {prioridade}
    </span>
  );
};
