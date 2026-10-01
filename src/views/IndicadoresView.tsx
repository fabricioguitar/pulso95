import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart,
  Receipt,
  Users,
  Building2
} from 'lucide-react';
import { Tarefa, ProcessoCard, Condominio, User, XeroxRegistro } from '../types';

interface IndicadoresViewProps {
  tarefas: Tarefa[];
  balanceteCards: ProcessoCard[];
  boletoCards: ProcessoCard[];
  condominios: Condominio[];
  users: User[];
  xeroxList: XeroxRegistro[];
}

export const IndicadoresView: React.FC<IndicadoresViewProps> = ({
  tarefas,
  balanceteCards,
  boletoCards,
  condominios,
  users,
  xeroxList
}) => {
  // Metrics (Section 50)
  const totalTarefas = tarefas.length;
  const concluidas = tarefas.filter(t => t.status === 'Concluída').length;
  const pendentes = tarefas.filter(t => t.status === 'Pendente' || t.status === 'Em andamento').length;
  const atrasadas = tarefas.filter(t => t.status === 'Atrasada').length;

  const totalBalancetes = balanceteCards.length;
  const balancetesConcluidos = balanceteCards.filter(c => c.status === 'Concluída').length;
  const balancetesEmAndamento = totalBalancetes - balancetesConcluidos;

  const totalBoletos = boletoCards.length;
  const boletosConcluidos = boletoCards.filter(c => c.status === 'Concluída').length;
  const boletosEmAndamento = totalBoletos - boletosConcluidos;

  // Condomínios por responsável (Section 51)
  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];
  const condominiosPorResp = [
    ...users.map((u, idx) => ({
      nome: u.nome,
      count: condominios.filter(c => c.responsavelNome?.toLowerCase() === u.nome.toLowerCase()).length,
      color: colors[idx % colors.length]
    })),
    {
      nome: 'Não cadastrado',
      count: condominios.filter(c => c.responsavelNome === 'Não cadastrado' || !c.responsavelNome).length,
      color: 'bg-slate-600'
    }
  ];

  // Tarefas por responsável (Section 51)
  const tarefasPorResp = users.map(u => ({
    nome: u.nome,
    total: tarefas.filter(t => t.responsavelNome.toLowerCase() === u.nome.toLowerCase()).length
  }));

  // Balancetes por responsável (Section 51)
  const balancetesPorResp = users.map(u => ({
    nome: u.nome,
    total: balanceteCards.filter(c => c.responsavelNome.toLowerCase() === u.nome.toLowerCase()).length
  }));

  return (
    <div className="space-y-6">
      {/* 8 Metric Cards (Section 50) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Total Tarefas</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{totalTarefas}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Pendentes</span>
          <span className="text-xl font-bold text-blue-400 font-mono mt-1 block">{pendentes}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Concluídas</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{concluidas}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Atrasadas</span>
          <span className="text-xl font-bold text-rose-400 font-mono mt-1 block">{atrasadas}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Balancetes Andam.</span>
          <span className="text-xl font-bold text-indigo-400 font-mono mt-1 block">{balancetesEmAndamento}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Balancetes Concl.</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{balancetesConcluidos}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Boletos Andam.</span>
          <span className="text-xl font-bold text-purple-400 font-mono mt-1 block">{boletosEmAndamento}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-semibold">Boletos Concl.</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{boletosConcluidos}</span>
        </div>
      </div>

      {/* Indicadores por Responsável (Section 51) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Condomínios por responsável */}
        <div className="p-5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Condomínios por Responsável</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">54 total</span>
          </div>

          <div className="space-y-2 pt-1">
            {condominiosPorResp.map(item => {
              const p = Math.round((item.count / 54) * 100);
              return (
                <div key={item.nome} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{item.nome}</span>
                    <span className="font-mono text-slate-400">{item.count} condomínios ({p}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarefas por responsável */}
        <div className="p-5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Tarefas por Responsável</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">{totalTarefas} total</span>
          </div>

          <div className="space-y-2 pt-1">
            {tarefasPorResp.map(item => {
              const p = totalTarefas > 0 ? Math.round((item.total / totalTarefas) * 100) : 0;
              return (
                <div key={item.nome} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{item.nome}</span>
                    <span className="font-mono text-slate-400">{item.total} tarefas ({p}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balancetes por responsável */}
        <div className="p-5 rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Balancetes por Responsável</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">{totalBalancetes} total</span>
          </div>

          <div className="space-y-2 pt-1">
            {balancetesPorResp.map(item => {
              const p = totalBalancetes > 0 ? Math.round((item.total / totalBalancetes) * 100) : 0;
              return (
                <div key={item.nome} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{item.nome}</span>
                    <span className="font-mono text-slate-400">{item.total} balancetes ({p}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
