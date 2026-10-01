import * as XLSX from 'xlsx';
import { Tarefa, ProcessoCard, PeriodoProcesso, Condominio } from '../types';

export class ExcelService {
  public static exportTarefasToExcel(tarefas: Tarefa[]): void {
    const rows = tarefas.map(t => ({
      ID: t.id,
      Condomínio: t.condominioNome,
      Tipo: t.tipo,
      Tarefa: t.titulo,
      Responsável: t.responsavelNome,
      'Criado por': t.criadoPor,
      'Data de criação': t.criadoEm,
      'Data de entrega': t.prazo,
      'Data de conclusão': t.concluidoEm || '—',
      Status: t.status,
      Prioridade: t.prioridade,
      'Valor (R$)': t.valorCalculado !== undefined ? t.valorCalculado : 0,
      'Checklist Progresso': t.checklist?.length
        ? `${t.checklist.filter(c => c.concluido).length}/${t.checklist.length}`
        : '—',
      'Informações adicionais': t.informacoesAdicionais || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarefas');
    XLSX.writeFile(workbook, 'PULSO95_Tarefas.xlsx');
  }

  public static exportBalancetesToExcel(cards: ProcessoCard[], periodos: PeriodoProcesso[]): void {
    const rows = cards.map(c => {
      const periodo = periodos.find(p => p.id === c.periodoId);
      const chk = (label: string) => {
        const item = c.checklist.find(i => i.label === label);
        if (!item) return '—';
        return item.concluido ? `Concluído (${item.concluidoEm || 'Sim'})` : 'Pendente';
      };

      return {
        ID: c.id,
        Condomínio: c.condominioNome,
        Período: periodo?.mesAno || '—',
        Responsável: c.responsavelNome,
        Status: c.status,
        Prazo: c.prazo,
        Anexar: chk('Anexar'),
        Conciliar: chk('Conciliar'),
        Analisar: chk('Analisar'),
        Ajustar: chk('Ajustar'),
        Enviar: chk('Enviar'),
        'Data de conclusão': c.concluidoEm || '—',
        'Informações adicionais': c.informacoesAdicionais || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Balancetes');
    XLSX.writeFile(workbook, 'PULSO95_Balancetes.xlsx');
  }

  public static exportCondominiosToExcel(condominios: Condominio[]): void {
    const rows = condominios.map((c, i) => ({
      '#': i + 1,
      Condomínio: c.nome,
      Responsável: c.responsavelNome,
      'Salão de Festas (R$)': c.valorSalaoFestas,
      'Churrasqueira (R$)': c.valorChurrasqueira,
      'Multa Leve (R$)': c.valorMultaLeve,
      'Multa Média (R$)': c.valorMultaMedia,
      'Multa Grave (R$)': c.valorMultaGrave,
      Endereço: c.endereco || '—'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Condomínios');
    XLSX.writeFile(workbook, 'PULSO95_Condominios.xlsx');
  }
}
