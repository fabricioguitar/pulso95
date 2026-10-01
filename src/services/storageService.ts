import {
  User,
  UserRole,
  UserStatus,
  Condominio,
  Tarefa,
  PeriodoProcesso,
  ProcessoCard,
  XeroxRegistro,
  Assembleia,
  ChatMessage,
  Notificacao,
  IdentidadeConfig,
  TaskAttachment,
  HistoricoItem
} from '../types';
import { HistoryService } from './historyService';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'pulso95_current_user_id',
  SESSION_ACTIVE: 'pulso95_session_active',
  USERS: 'pulso95_users',
  CONDOMINIOS: 'pulso95_condominios',
  TAREFAS: 'pulso95_tarefas',
  BALANCETE_PERIODOS: 'pulso95_balancete_periodos',
  BALANCETE_CARDS: 'pulso95_balancete_cards',
  BOLETO_PERIODOS: 'pulso95_boleto_periodos',
  BOLETO_CARDS: 'pulso95_boleto_cards',
  XEROX: 'pulso95_xerox',
  ASSEMBLEIAS: 'pulso95_assembleias',
  CHAT_GERAL: 'pulso95_chat_geral',
  NOTIFICACOES: 'pulso95_notificacoes',
  IDENTIDADE: 'pulso95_identidade',
  THEME: 'pulso95_theme',
};

// Exact 54 Condominiums list from Section 13 with Fabrício as initially assigned responsible
export const INITIAL_CONDOMINIOS_DATA: Array<{ nome: string; responsavelNome: string }> = [
  { nome: 'COLONIAL SUL', responsavelNome: 'Fabrício' },
  { nome: 'CRUZEIRO DO SUL', responsavelNome: 'Fabrício' },
  { nome: 'DIPLOMATA', responsavelNome: 'Fabrício' },
  { nome: 'EVITA PERON', responsavelNome: 'Fabrício' },
  { nome: 'FIRENZE', responsavelNome: 'Fabrício' },
  { nome: 'FLAMBOYANT', responsavelNome: 'Fabrício' },
  { nome: 'FLÁVIA', responsavelNome: 'Fabrício' },
  { nome: 'FLORENÇA', responsavelNome: 'Fabrício' },
  { nome: 'GRAND CLUB', responsavelNome: 'Fabrício' },
  { nome: 'GRIFFE MARIA ROSA', responsavelNome: 'Fabrício' },
  { nome: 'HORTÊNCIAS', responsavelNome: 'Fabrício' },
  { nome: 'HORTO DO YPÊ', responsavelNome: 'Fabrício' },
  { nome: 'IGREJA', responsavelNome: 'Não cadastrado' },
  { nome: 'IPÊ', responsavelNome: 'Fabrício' },
  { nome: 'ITAÚBA', responsavelNome: 'Fabrício' },
  { nome: 'JOY VILA RÉ', responsavelNome: 'Fabrício' },
  { nome: 'MINAS GERAIS', responsavelNome: 'Fabrício' },
  { nome: 'MONACO', responsavelNome: 'Fabrício' },
  { nome: 'MONTE AZUL', responsavelNome: 'Fabrício' },
  { nome: 'MORUMBI LIFE', responsavelNome: 'Fabrício' },
  { nome: 'NOVA EUROPA', responsavelNome: 'Fabrício' },
  { nome: 'OCEANO ATLÂNTICO', responsavelNome: 'Fabrício' },
  { nome: 'OCEANO ÍNDICO', responsavelNome: 'Fabrício' },
  { nome: 'OPERA PRIMA', responsavelNome: 'Fabrício' },
  { nome: 'OURO VERDE', responsavelNome: 'Fabrício' },
  { nome: 'PAÇO DAS ILHAS', responsavelNome: 'Fabrício' },
  { nome: 'PANAMÁ', responsavelNome: 'Fabrício' },
  { nome: 'PANORAMA', responsavelNome: 'Fabrício' },
  { nome: 'PARAGUAI', responsavelNome: 'Fabrício' },
  { nome: 'PENIEL', responsavelNome: 'Não cadastrado' },
  { nome: 'PETRÓPOLIS', responsavelNome: 'Fabrício' },
  { nome: 'PIAZZA DI SPAGNA', responsavelNome: 'Fabrício' },
  { nome: 'PICCOLO MONDO', responsavelNome: 'Fabrício' },
  { nome: 'PIRINEUS', responsavelNome: 'Fabrício' },
  { nome: 'PORTAL DE ITAPECERICA', responsavelNome: 'Fabrício' },
  { nome: 'PORTAL DO SOL', responsavelNome: 'Fabrício' },
  { nome: 'PORTINARI', responsavelNome: 'Fabrício' },
  { nome: 'PRIMAVERA', responsavelNome: 'Fabrício' },
  { nome: 'RECANTO DO BOSQUE', responsavelNome: 'Fabrício' },
  { nome: 'RECANTO DOS PÁSSAROS', responsavelNome: 'Fabrício' },
  { nome: 'RG DOMINGOS', responsavelNome: 'Fabrício' },
  { nome: 'RIO GRANDE DO SUL', responsavelNome: 'Fabrício' },
  { nome: 'SAINT THOMAS', responsavelNome: 'Fabrício' },
  { nome: 'SAN PABLO', responsavelNome: 'Fabrício' },
  { nome: 'SANTA CATARINA', responsavelNome: 'Fabrício' },
  { nome: 'SCANDIA', responsavelNome: 'Fabrício' },
  { nome: 'SING', responsavelNome: 'Fabrício' },
  { nome: 'SOLARES C', responsavelNome: 'Fabrício' },
  { nome: 'STUDIO 38', responsavelNome: 'Fabrício' },
  { nome: 'VALO VELHO B', responsavelNome: 'Fabrício' },
  { nome: 'VIELA DA PAZ A1', responsavelNome: 'Fabrício' },
  { nome: 'VILA ANDRADE D', responsavelNome: 'Fabrício' },
  { nome: 'VILA SÃO FRANCISCO', responsavelNome: 'Fabrício' },
  { nome: 'VINÍCIUS DE MORAES', responsavelNome: 'Fabrício' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_fabricio',
    nome: 'Fabrício',
    cargo: 'Master / Administrador',
    role: 'master',
    avatar: '',
    email: 'fabricioguitar82@gmail.com',
    status: 'ativo',
    criadoEm: '2026-09-01',
    permissoes: {
      modulosPermitidos: [
        'inicio', 'tarefas', 'condominios', 'balancetes', 'boletos',
        'xerox', 'assembleias', 'chat', 'indicadores', 'historico', 'configuracoes'
      ],
      podeCriarTarefas: true,
      podeEditarCondominios: true,
      podeGerenciarXerox: true,
      podeGerenciarAssembleias: true
    }
  }
];

export const INITIAL_IDENTIDADE: IdentidadeConfig = {
  nomeSistema: 'PULSO95',
  subtitulo: 'Gestão inteligente de processos',
  logoUrl: '',
  corPrincipal: '#2563EB',
  corSecundaria: '#4F46E5',
  temaPadrao: 'dark',
  precoXeroxPreto: 0.20,
  precoXeroxColorida: 1.00
};

export class StorageService {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao gravar no localStorage [${key}]:`, e);
    }
  }

  public static init(): void {
    const existingUsers = this.get<User[]>(STORAGE_KEYS.USERS, []);
    const hasAntonyOrRenata = existingUsers.some(u => u.nome === 'Antony' || u.nome === 'Renata');
    if (!existingUsers.length || hasAntonyOrRenata) {
      this.resetAllData();
    }
  }

  // Pre-seed 54 Condominiums exactly per requirements
  public static buildInitialCondominios(): Condominio[] {
    const users = this.getUsers();
    return INITIAL_CONDOMINIOS_DATA.map((item, idx) => {
      const id = `condo_${idx + 1}`;
      const matchedUser = users.find(u => u.nome.toLowerCase() === item.responsavelNome.toLowerCase());
      const responsavelId = matchedUser ? matchedUser.id : (users[0]?.id || 'user_fabricio');

      // Example values for Grand Club & Firenze so initial demo has active multas, while others start at 0.00
      let salao = 0;
      let churrasqueira = 0;
      let leve = 0;
      let media = 0;
      let grave = 0;

      if (item.nome === 'GRAND CLUB') {
        salao = 350;
        churrasqueira = 180;
        leve = 150;
        media = 300;
        grave = 600;
      } else if (item.nome === 'FIRENZE') {
        salao = 200;
        churrasqueira = 100;
        leve = 100;
        media = 250;
        grave = 500;
      } else if (item.nome === 'CRUZEIRO DO SUL') {
        salao = 180;
        churrasqueira = 90;
      }

      return {
        id,
        nome: item.nome,
        responsavelId,
        responsavelNome: item.responsavelNome,
        valorSalaoFestas: salao,
        valorChurrasqueira: churrasqueira,
        valorMultaLeve: leve,
        valorMultaMedia: media,
        valorMultaGrave: grave,
        unidades: 48,
        endereco: 'São Paulo - SP'
      };
    });
  }

  public static buildInitialTarefas(condos: Condominio[]): Tarefa[] {
    const grandClub = condos.find(c => c.nome === 'GRAND CLUB') || condos[0];
    const colonialSul = condos.find(c => c.nome === 'COLONIAL SUL') || condos[0];
    const cruzeiro = condos.find(c => c.nome === 'CRUZEIRO DO SUL') || condos[0];
    const firenze = condos.find(c => c.nome === 'FIRENZE') || condos[0];

    return [
      {
        id: 'task_1',
        titulo: 'Conferir documentação e advertência de barulho',
        condominioId: grandClub.id,
        condominioNome: grandClub.nome,
        tipo: 'Multa',
        gravidade: 'Média',
        valorCalculado: grandClub.valorMultaMedia,
        responsavelId: grandClub.responsavelId,
        responsavelNome: grandClub.responsavelNome,
        prazo: '2026-09-30',
        prioridade: 'Alta',
        status: 'Em andamento',
        informacoesAdicionais: 'Morador da unidade 42B notificado sobre reiterado descumprimento do regimento interno.',
        anexos: [
          {
            id: 'att_1',
            nome: 'notificacao_unidade_42b.pdf',
            tamanho: '1.2 MB',
            tipo: 'PDF',
            data: '28/09/2026',
            autorNome: 'Fabrício'
          }
        ],
        checklist: [
          { id: 'tc_1', texto: 'Verificar livro de ocorrências', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '28/09/2026' },
          { id: 'tc_2', texto: 'Conferir valor da multa média no cadastro', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '29/09/2026' },
          { id: 'tc_3', texto: 'Emitir notificação formal', concluido: false },
          { id: 'tc_4', texto: 'Enviar para assinatura do síndico', concluido: false }
        ],
        comentarios: [
          {
            id: 'comm_1',
            autorId: 'user_fabricio',
            autorNome: 'Fabrício',
            texto: 'Conferi o livro de ocorrências. Há 3 advertências prévias registradas.',
            dataHora: '29/09/2026 10:15'
          },
          {
            id: 'comm_2',
            autorId: 'user_fabricio',
            autorNome: 'Fabrício',
            texto: 'Perfeito. Prosseguindo com a emissão da multa conforme regimento.',
            dataHora: '29/09/2026 10:30'
          }
        ],
        criadoEm: '2026-09-27',
        criadoPor: 'Fabrício'
      },
      {
        id: 'task_2',
        titulo: 'Atualizar cadastro de proprietários e inquilinos',
        condominioId: colonialSul.id,
        condominioNome: colonialSul.nome,
        tipo: 'Tarefa geral',
        responsavelId: colonialSul.responsavelId,
        responsavelNome: colonialSul.responsavelNome,
        prazo: '2026-10-05',
        prioridade: 'Média',
        status: 'Pendente',
        informacoesAdicionais: 'Cruzar fichas preenchidas na portaria com o sistema de cobrança.',
        anexos: [],
        checklist: [
          { id: 'tc_5', texto: 'Receber planilhas da portaria', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '28/09/2026' },
          { id: 'tc_6', texto: 'Validar dados bancários e e-mails', concluido: false },
          { id: 'tc_7', texto: 'Atualizar lista de transmissão', concluido: false }
        ],
        comentarios: [],
        criadoEm: '2026-09-28',
        criadoPor: 'Fabrício'
      },
      {
        id: 'task_3',
        titulo: 'Reserva do salão de festas — Vistoria prévia',
        condominioId: cruzeiro.id,
        condominioNome: cruzeiro.nome,
        tipo: 'Salão de festas',
        valorCalculado: cruzeiro.valorSalaoFestas,
        responsavelId: cruzeiro.responsavelId,
        responsavelNome: cruzeiro.responsavelNome,
        prazo: '2026-09-29',
        prioridade: 'Alta',
        status: 'Atrasada',
        informacoesAdicionais: 'Evento agendado para o fim de semana. Taxa de locação conferida.',
        anexos: [],
        checklist: [
          { id: 'tc_8', texto: 'Checar termo de responsabilidade', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '27/09/2026' },
          { id: 'tc_9', texto: 'Conferir mobiliário e louças', concluido: false }
        ],
        comentarios: [],
        criadoEm: '2026-09-25',
        criadoPor: 'Fabrício'
      },
      {
        id: 'task_4',
        titulo: 'Conferência documental de notas fiscais de manutenção',
        condominioId: firenze.id,
        condominioNome: firenze.nome,
        tipo: 'Tarefa geral',
        responsavelId: firenze.responsavelId,
        responsavelNome: firenze.responsavelNome,
        prazo: '2026-09-28',
        prioridade: 'Média',
        status: 'Concluída',
        informacoesAdicionais: 'Notas fiscais do elevador e bombas hidráulicas arquivadas na pasta digital.',
        anexos: [],
        checklist: [
          { id: 'tc_10', texto: 'Conferir CNPJ prestador', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '28/09/2026' },
          { id: 'tc_11', texto: 'Lançar comprovante de pagamento', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '28/09/2026' }
        ],
        comentarios: [],
        criadoEm: '2026-09-24',
        criadoPor: 'Fabrício',
        concluidoEm: '28/09/2026',
        concluidoPor: 'Fabrício'
      }
    ];
  }

  public static buildInitialBalancetes(condos: Condominio[]): { periodos: PeriodoProcesso[]; cards: ProcessoCard[] } {
    const periodo: PeriodoProcesso = {
      id: 'per_balancete_set2026',
      tipo: 'balancete',
      mes: 'Setembro',
      ano: '2026',
      mesAno: 'Setembro/2026',
      statusGeral: 'Em andamento',
      criadoEm: '2026-09-01',
      criadoPor: 'Fabrício'
    };

    // Initial 3 specified in Section 54: GRAND CLUB, COLONIAL SUL, FIRENZE
    const targetNames = ['GRAND CLUB', 'COLONIAL SUL', 'FIRENZE', 'CRUZEIRO DO SUL', 'DIPLOMATA'];
    const selectedCondos = condos.filter(c => targetNames.includes(c.nome));

    const cards: ProcessoCard[] = selectedCondos.map((c, i) => {
      const isGrandClub = c.nome === 'GRAND CLUB';
      const isColonial = c.nome === 'COLONIAL SUL';

      const checklist = [
        {
          id: `chk_${c.id}_1`,
          label: 'Anexar',
          concluido: isGrandClub || isColonial || i === 0,
          concluidoPor: c.responsavelNome,
          concluidoEm: '10/09/2026 10:15'
        },
        {
          id: `chk_${c.id}_2`,
          label: 'Conciliar',
          concluido: isGrandClub || isColonial,
          concluidoPor: c.responsavelNome,
          concluidoEm: '15/09/2026 14:20'
        },
        {
          id: `chk_${c.id}_3`,
          label: 'Analisar',
          concluido: isGrandClub,
          concluidoPor: c.responsavelNome,
          concluidoEm: '20/09/2026 16:45'
        },
        {
          id: `chk_${c.id}_4`,
          label: 'Ajustar',
          concluido: false
        },
        {
          id: `chk_${c.id}_5`,
          label: 'Enviar',
          concluido: false
        }
      ];

      return {
        id: `card_balancete_${c.id}_set26`,
        periodoId: periodo.id,
        tipoProcesso: 'balancete',
        condominioId: c.id,
        condominioNome: c.nome,
        responsavelId: c.responsavelId,
        responsavelNome: c.responsavelNome,
        prazo: '2026-10-10',
        status: isGrandClub ? 'Em andamento' : 'Pendente',
        checklist,
        informacoesAdicionais: isGrandClub
          ? 'Conta de água da área comum validada.'
          : 'Extratos bancários conferidos.',
        comentarios: []
      };
    });

    return { periodos: [periodo], cards };
  }

  public static buildInitialBoletos(condos: Condominio[]): { periodos: PeriodoProcesso[]; cards: ProcessoCard[] } {
    const periodo: PeriodoProcesso = {
      id: 'per_boleto_set2026',
      tipo: 'boleto',
      mes: 'Setembro',
      ano: '2026',
      mesAno: 'Setembro/2026',
      statusGeral: 'Em andamento',
      criadoEm: '2026-09-01',
      criadoPor: 'Fabrício'
    };

    const targetNames = ['GRAND CLUB', 'COLONIAL SUL', 'FIRENZE'];
    const selectedCondos = condos.filter(c => targetNames.includes(c.nome));

    const cards: ProcessoCard[] = selectedCondos.map((c, i) => {
      const isFirenze = c.nome === 'FIRENZE';

      const checklist = [
        { id: `chk_bol_${c.id}_1`, label: 'Consumos', concluido: true, concluidoPor: 'Fabrício', concluidoEm: '18/09/2026 09:30' },
        { id: `chk_bol_${c.id}_2`, label: 'Emissão', concluido: isFirenze, concluidoPor: 'Fabrício', concluidoEm: '22/09/2026 15:10' },
        { id: `chk_bol_${c.id}_3`, label: 'Análise', concluido: false },
        { id: `chk_bol_${c.id}_4`, label: 'Ajustes', concluido: false },
        { id: `chk_bol_${c.id}_5`, label: 'Envio', concluido: false }
      ];

      return {
        id: `card_boleto_${c.id}_set26`,
        periodoId: periodo.id,
        tipoProcesso: 'boleto',
        condominioId: c.id,
        condominioNome: c.nome,
        responsavelId: c.responsavelId,
        responsavelNome: c.responsavelNome,
        prazo: '2026-09-30',
        status: isFirenze ? 'Em andamento' : 'Pendente',
        checklist,
        informacoesAdicionais: 'Leitura de água e gás importadas da planilha.',
        comentarios: []
      };
    });

    return { periodos: [periodo], cards };
  }

  public static buildInitialXerox(condos: Condominio[]): XeroxRegistro[] {
    const grand = condos.find(c => c.nome === 'GRAND CLUB') || condos[0];
    const colonial = condos.find(c => c.nome === 'COLONIAL SUL') || condos[1];

    return [
      {
        id: 'xerox_1',
        condominioId: grand.id,
        condominioNome: grand.nome,
        data: '2026-09-28',
        tipo: 'preto_branco',
        quantidade: 30,
        valorUnitario: 0.20,
        valorTotal: 6.00,
        informacoesAdicionais: 'Comunicados de convocação da assembleia',
        registradoPor: 'Fabrício'
      },
      {
        id: 'xerox_2',
        condominioId: colonial.id,
        condominioNome: colonial.nome,
        data: '2026-09-29',
        tipo: 'colorida',
        quantidade: 25,
        valorUnitario: 1.00,
        valorTotal: 25.00,
        informacoesAdicionais: 'Cartazes de conscientização sobre coleta seletiva',
        registradoPor: 'Fabrício'
      }
    ];
  }

  public static buildInitialAssembleias(condos: Condominio[]): Assembleia[] {
    const grand = condos.find(c => c.nome === 'GRAND CLUB') || condos[0];
    const firenze = condos.find(c => c.nome === 'FIRENZE') || condos[1];

    return [
      {
        id: 'assemb_1',
        condominioId: grand.id,
        condominioNome: grand.nome,
        data: '2026-10-15',
        horario: '19:30',
        editalTexto: 'Assembleia Geral Ordinária para prestação de contas do exercício 2026 e eleição de síndico.',
        editalArquivo: {
          id: 'att_edital_1',
          nome: 'edital_grand_club_ago_2026.pdf',
          tamanho: '850 KB',
          tipo: 'PDF',
          data: '28/09/2026',
          autorNome: 'Fabrício'
        },
        informacoesBoleto: 'Lembrete de comparecimento impresso no rodapé do boleto de Outubro/2026.',
        emailsAdicionais: 'sindico@grandclub.com.br, conselho@grandclub.com.br',
        observacoes: 'Haverá transmissão híbrida pelo Google Meet.',
        status: 'agendada'
      },
      {
        id: 'assemb_2',
        condominioId: firenze.id,
        condominioNome: firenze.nome,
        data: '2026-10-22',
        horario: '20:00',
        editalTexto: 'Assembleia Extraordinária para deliberação da reforma estrutural da fachada e impermeabilização.',
        editalArquivo: {
          id: 'att_edital_2',
          nome: 'edital_firenze_reforma_fachada.pdf',
          tamanho: '1.4 MB',
          tipo: 'PDF',
          data: '29/09/2026',
          autorNome: 'Fabrício'
        },
        informacoesBoleto: 'Rateio extraordinário em 12 parcelas a ser votado.',
        emailsAdicionais: 'administracao@firenze.com.br',
        observacoes: 'Orçamentos anexados para apresentação aos condôminos.',
        status: 'agendada'
      }
    ];
  }

  public static buildInitialChat(): ChatMessage[] {
    return [
      {
        id: 'chat_1',
        autorId: 'user_fabricio',
        autorNome: 'Fabrício',
        autorRole: 'Master',
        texto: 'Bem-vindos ao PULSO95! Esta é a nossa central unificada de processos, tarefas e comunicação.',
        dataHora: '29/09/2026 09:00'
      }
    ];
  }

  public static buildInitialNotificacoes(): Notificacao[] {
    return [
      {
        id: 'notif_1',
        titulo: 'Bem-vindo ao PULSO95',
        descricao: 'Você é o Administrador Master da plataforma. Novos usuários que se cadastrarem aguardarão sua aprovação em Configurações → Usuários.',
        tipo: 'sistema',
        lida: false,
        criadaEm: 'Hoje às 08:00',
        linkTab: 'configuracoes'
      },
      {
        id: 'notif_2',
        titulo: 'Período Setembro/2026 Ativo',
        descricao: 'Processos de Balancetes e Boletos de Setembro/2026 disponíveis para conferência.',
        tipo: 'balancete',
        lida: false,
        criadaEm: 'Hoje às 08:30',
        linkTab: 'balancetes'
      }
    ];
  }

  public static resetAllData(): void {
    const users = INITIAL_USERS;
    const condos = this.buildInitialCondominios();
    const tarefas = this.buildInitialTarefas(condos);
    const { periodos: balPeriodos, cards: balCards } = this.buildInitialBalancetes(condos);
    const { periodos: bolPeriodos, cards: bolCards } = this.buildInitialBoletos(condos);
    const xerox = this.buildInitialXerox(condos);
    const assembleias = this.buildInitialAssembleias(condos);
    const chat = this.buildInitialChat();
    const notifs = this.buildInitialNotificacoes();

    this.set(STORAGE_KEYS.USERS, users);
    this.set(STORAGE_KEYS.CURRENT_USER_ID, 'user_fabricio');
    this.set(STORAGE_KEYS.CONDOMINIOS, condos);
    this.set(STORAGE_KEYS.TAREFAS, tarefas);
    this.set(STORAGE_KEYS.BALANCETE_PERIODOS, balPeriodos);
    this.set(STORAGE_KEYS.BALANCETE_CARDS, balCards);
    this.set(STORAGE_KEYS.BOLETO_PERIODOS, bolPeriodos);
    this.set(STORAGE_KEYS.BOLETO_CARDS, bolCards);
    this.set(STORAGE_KEYS.XEROX, xerox);
    this.set(STORAGE_KEYS.ASSEMBLEIAS, assembleias);
    this.set(STORAGE_KEYS.CHAT_GERAL, chat);
    this.set(STORAGE_KEYS.NOTIFICACOES, notifs);
    this.set(STORAGE_KEYS.IDENTIDADE, INITIAL_IDENTIDADE);
    this.set(STORAGE_KEYS.THEME, 'dark');

    HistoryService.addLog({
      usuarioNome: 'Sistema',
      usuarioId: 'sys',
      modulo: 'Identidade',
      acao: 'Restaurou dados de teste',
      item: 'Base de dados inicial com 54 condomínios'
    });
  }

  // Backup & Restore (Section 56)
  public static exportFullBackupJson(): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      users: this.getUsers(),
      condominios: this.getCondominios(),
      tarefas: this.getTarefas(),
      balancetePeriodos: this.getPeriodos('balancete'),
      balanceteCards: this.getProcessoCards('balancete'),
      boletoPeriodos: this.getPeriodos('boleto'),
      boletoCards: this.getProcessoCards('boleto'),
      xerox: this.getXerox(),
      assembleias: this.getAssembleias(),
      identidade: this.getIdentidade(),
      history: HistoryService.getLogs()
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importFullBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) this.set(STORAGE_KEYS.USERS, data.users);
      if (data.condominios) this.set(STORAGE_KEYS.CONDOMINIOS, data.condominios);
      if (data.tarefas) this.set(STORAGE_KEYS.TAREFAS, data.tarefas);
      if (data.balancetePeriodos) this.set(STORAGE_KEYS.BALANCETE_PERIODOS, data.balancetePeriodos);
      if (data.balanceteCards) this.set(STORAGE_KEYS.BALANCETE_CARDS, data.balanceteCards);
      if (data.boletoPeriodos) this.set(STORAGE_KEYS.BOLETO_PERIODOS, data.boletoPeriodos);
      if (data.boletoCards) this.set(STORAGE_KEYS.BOLETO_CARDS, data.boletoCards);
      if (data.xerox) this.set(STORAGE_KEYS.XEROX, data.xerox);
      if (data.assembleias) this.set(STORAGE_KEYS.ASSEMBLEIAS, data.assembleias);
      if (data.identidade) this.set(STORAGE_KEYS.IDENTIDADE, data.identidade);

      HistoryService.addLog({
        usuarioNome: this.getCurrentUser().nome,
        usuarioId: this.getCurrentUserId(),
        modulo: 'Identidade',
        acao: 'Importou backup completo',
        item: 'Arquivo JSON restaurado'
      });
      return true;
    } catch (e) {
      console.error('Falha ao importar backup:', e);
      return false;
    }
  }

  // Current User
  public static getCurrentUserId(): string {
    return this.get<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_fabricio');
  }

  public static setCurrentUserId(id: string): void {
    this.set(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public static isSessionActive(): boolean {
    return this.get<boolean>(STORAGE_KEYS.SESSION_ACTIVE, true);
  }

  public static setSessionActive(active: boolean): void {
    this.set(STORAGE_KEYS.SESSION_ACTIVE, active);
  }

  public static logout(): void {
    this.setSessionActive(false);
  }

  public static login(userId: string): User | null {
    const user = this.getUsers().find(u => u.id === userId);
    if (user) {
      this.setCurrentUserId(user.id);
      this.setSessionActive(true);
      return user;
    }
    return null;
  }

  public static getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getCurrentUserId();
    return users.find(u => u.id === currentId) || users[0];
  }

  // Users Management (Section 6, 8, 52)
  public static getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public static getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public static getPendingUsers(): User[] {
    return this.getUsers().filter(u => u.status === 'pendente');
  }

  public static registerNewUser(data: {
    nome: string;
    email: string;
    cargo: string;
    avatar?: string;
  }): User {
    const list = this.getUsers();
    const existing = this.getUserByEmail(data.email);
    if (existing) {
      this.setCurrentUserId(existing.id);
      this.setSessionActive(true);
      return existing;
    }

    const isMasterFab = data.email.toLowerCase().trim() === 'fabricioguitar82@gmail.com' ||
      data.email.toLowerCase().trim() === 'fabricio@peniel.com.br' ||
      data.nome.toLowerCase().trim() === 'fabrício' ||
      data.nome.toLowerCase().trim() === 'fabricio';

    const newUser: User = {
      id: `user_${Date.now()}`,
      nome: data.nome.trim(),
      email: data.email.trim(),
      cargo: isMasterFab ? 'Master / Administrador' : (data.cargo.trim() || 'Colaborador'),
      role: isMasterFab ? 'master' : 'colaborador',
      status: isMasterFab ? 'ativo' : 'pendente', // Fabrício is active; others are pendente!
      avatar: data.avatar || '',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      permissoes: {
        modulosPermitidos: isMasterFab
          ? ['inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores', 'historico', 'configuracoes']
          : ['inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'],
        podeCriarTarefas: true,
        podeEditarCondominios: isMasterFab,
        podeGerenciarXerox: true,
        podeGerenciarAssembleias: isMasterFab
      }
    };

    list.push(newUser);
    this.set(STORAGE_KEYS.USERS, list);
    this.setCurrentUserId(newUser.id);
    this.setSessionActive(true);

    if (!isMasterFab) {
      // Add notification for Master
      this.addNotificacao({
        titulo: 'Novo cadastro aguardando aprovação',
        descricao: `${newUser.nome} (${newUser.cargo} - ${newUser.email}) solicitou acesso ao PULSO95.`,
        tipo: 'sistema',
        linkTab: 'configuracoes'
      });
    }

    HistoryService.addLog({
      usuarioNome: newUser.nome,
      usuarioId: newUser.id,
      modulo: 'Usuários',
      acao: isMasterFab ? 'Login Master' : 'Solicitou cadastro (Pendente)',
      item: `${newUser.nome} (${newUser.email})`
    });

    return newUser;
  }

  public static approveUser(userId: string, role: UserRole = 'colaborador', modulosPermitidos?: string[]): User | undefined {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === userId);
    if (idx < 0) return undefined;

    const master = this.getCurrentUser();
    const now = new Date();
    const stamp = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    list[idx].status = 'ativo';
    list[idx].role = role;
    list[idx].aprovadoPor = master.nome;
    list[idx].aprovadoEm = stamp;
    if (modulosPermitidos) {
      list[idx].permissoes = {
        ...(list[idx].permissoes || { podeCriarTarefas: true, podeEditarCondominios: false, podeGerenciarXerox: true, podeGerenciarAssembleias: false }),
        modulosPermitidos
      };
    }

    this.set(STORAGE_KEYS.USERS, list);

    HistoryService.addLog({
      usuarioNome: master.nome,
      usuarioId: master.id,
      modulo: 'Usuários',
      acao: 'Aprovou acesso de usuário',
      item: `${list[idx].nome} (Status: Ativo)`
    });

    this.addNotificacao({
      titulo: 'Usuário Aprovado',
      descricao: `O acesso de ${list[idx].nome} foi aprovado com sucesso.`,
      tipo: 'sistema',
      linkTab: 'configuracoes'
    });

    return list[idx];
  }

  public static blockUser(userId: string, motivo?: string): User | undefined {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === userId);
    if (idx < 0) return undefined;
    if (list[idx].role === 'master') return list[idx]; // Cannot block Master

    const master = this.getCurrentUser();
    list[idx].status = 'bloqueado';
    list[idx].motivoBloqueio = motivo || 'Acesso suspenso pelo administrador Master.';
    this.set(STORAGE_KEYS.USERS, list);

    HistoryService.addLog({
      usuarioNome: master.nome,
      usuarioId: master.id,
      modulo: 'Usuários',
      acao: 'Bloqueou usuário',
      item: `${list[idx].nome} (Status: Bloqueado)`
    });

    return list[idx];
  }

  public static reactivateUser(userId: string): User | undefined {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === userId);
    if (idx < 0) return undefined;

    const master = this.getCurrentUser();
    list[idx].status = 'ativo';
    list[idx].motivoBloqueio = undefined;
    this.set(STORAGE_KEYS.USERS, list);

    HistoryService.addLog({
      usuarioNome: master.nome,
      usuarioId: master.id,
      modulo: 'Usuários',
      acao: 'Reativou usuário',
      item: `${list[idx].nome} (Status: Ativo)`
    });

    return list[idx];
  }

  public static saveUser(userData: Omit<User, 'id'> & { id?: string }): User {
    const list = this.getUsers();
    const currentUser = this.getCurrentUser();

    if (userData.id) {
      const idx = list.findIndex(u => u.id === userData.id);
      if (idx >= 0) {
        const prev = list[idx];
        list[idx] = { ...prev, ...userData } as User;
        this.set(STORAGE_KEYS.USERS, list);

        HistoryService.addLog({
          usuarioNome: currentUser.nome,
          usuarioId: currentUser.id,
          modulo: 'Usuários',
          acao: 'Editou usuário',
          item: list[idx].nome,
          valorAnterior: `${prev.nome} (${prev.cargo} - ${prev.status})`,
          valorNovo: `${list[idx].nome} (${list[idx].cargo} - ${list[idx].status})`
        });

        return list[idx];
      }
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      status: userData.status || 'ativo',
      permissoes: userData.permissoes || {
        modulosPermitidos: ['inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores'],
        podeCriarTarefas: true,
        podeEditarCondominios: userData.role === 'master',
        podeGerenciarXerox: true,
        podeGerenciarAssembleias: userData.role === 'master'
      }
    };
    list.push(newUser);
    this.set(STORAGE_KEYS.USERS, list);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Usuários',
      acao: 'Cadastrou novo usuário',
      item: `${newUser.nome} (${newUser.cargo})`
    });

    return newUser;
  }

  public static deleteUser(id: string): boolean {
    const list = this.getUsers();
    const user = list.find(u => u.id === id);
    if (!user || user.role === 'master') return false; // Prevent deleting Master

    const filtered = list.filter(u => u.id !== id);
    this.set(STORAGE_KEYS.USERS, filtered);

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Usuários',
      acao: 'Excluiu usuário',
      item: user.nome
    });

    return true;
  }

  public static updateUserAvatar(userId: string, avatarBase64: string): void {
    const list = this.getUsers();
    const user = list.find(u => u.id === userId);
    if (user) {
      user.avatar = avatarBase64;
      this.set(STORAGE_KEYS.USERS, list);

      HistoryService.addLog({
        usuarioNome: this.getCurrentUser().nome,
        usuarioId: this.getCurrentUserId(),
        modulo: 'Usuários',
        acao: avatarBase64 ? 'Alterou foto de perfil' : 'Removeu foto de perfil',
        item: user.nome
      });
    }
  }

  public static updateUserStatus(id: string, status: UserStatus, motivoBloqueio?: string): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        status,
        motivoBloqueio
      };
      this.set(STORAGE_KEYS.USERS, users);
    }
  }

  // Condomínios (Section 11, 12, 13, 14)
  public static getCondominios(): Condominio[] {
    return this.get<Condominio[]>(STORAGE_KEYS.CONDOMINIOS, []);
  }

  public static getCondominioById(id: string): Condominio | undefined {
    return this.getCondominios().find(c => c.id === id);
  }

  public static saveCondominios(condos: Condominio[]): void {
    this.set(STORAGE_KEYS.CONDOMINIOS, condos);
  }

  public static saveTarefas(tarefas: Tarefa[]): void {
    this.set(STORAGE_KEYS.TAREFAS, tarefas);
  }

  public static getTarefaById(id: string): Tarefa | undefined {
    return this.getTarefas().find(t => t.id === id);
  }

  public static saveProcessoCards(tipo: 'balancete' | 'boleto', cards: ProcessoCard[]): void {
    const key = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    this.set(key, cards);
  }

  public static saveProcessoCard(card: ProcessoCard): void {
    const key = card.tipoProcesso === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    const cards = this.getProcessoCards(card.tipoProcesso);
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.push(card);
    }
    this.set(key, cards);
  }

  public static deleteProcessoCard(id: string): void {
    for (const tipo of ['balancete', 'boleto'] as const) {
      const key = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
      const cards = this.getProcessoCards(tipo);
      const filtered = cards.filter(c => c.id !== id);
      if (filtered.length !== cards.length) {
        this.set(key, filtered);
      }
    }
  }

  public static getXeroxRegistros(): XeroxRegistro[] {
    return this.getXerox();
  }

  public static saveXeroxRegistros(registros: XeroxRegistro[]): void {
    this.set(STORAGE_KEYS.XEROX, registros);
  }

  public static saveXeroxRegistro(reg: XeroxRegistro): XeroxRegistro {
    return this.saveXerox(reg);
  }

  public static deleteXeroxRegistro(id: string): boolean {
    return this.deleteXerox(id);
  }

  public static saveAssembleias(assembleias: Assembleia[]): void {
    this.set(STORAGE_KEYS.ASSEMBLEIAS, assembleias);
  }

  public static getChatMessages(): ChatMessage[] {
    return this.getChatGeral();
  }

  public static saveChatMessages(messages: ChatMessage[]): void {
    this.set(STORAGE_KEYS.CHAT_GERAL, messages);
  }

  public static addChatMessage(message: ChatMessage): void {
    const msgs = this.getChatGeral();
    msgs.push(message);
    this.set(STORAGE_KEYS.CHAT_GERAL, msgs);
  }

  public static saveNotificacoes(notifs: Notificacao[]): void {
    this.set(STORAGE_KEYS.NOTIFICACOES, notifs);
  }

  public static markNotificacaoLida(id: string): void {
    this.markNotificacaoAsRead(id);
  }

  public static markAllNotificacoesLidas(): void {
    this.markAllNotificacoesAsRead();
  }

  public static getHistoryLogs(): HistoricoItem[] {
    return HistoryService.getLogs();
  }

  public static saveHistoryLogs(logs: HistoricoItem[]): void {
    HistoryService.saveLogs(logs);
  }

  public static addHistoryLog(item: HistoricoItem): void {
    HistoryService.addHistoryLog(item);
  }

  public static saveCondominio(condo: Omit<Condominio, 'id'> & { id?: string }): Condominio {
    const list = this.getCondominios();
    const currentUser = this.getCurrentUser();

    if (condo.id) {
      const idx = list.findIndex(c => c.id === condo.id);
      if (idx >= 0) {
        const prev = list[idx];
        const updated: Condominio = {
          ...prev,
          ...condo
        };
        list[idx] = updated;
        this.set(STORAGE_KEYS.CONDOMINIOS, list);

        HistoryService.addLog({
          usuarioNome: currentUser.nome,
          usuarioId: currentUser.id,
          modulo: 'Condomínios',
          acao: 'Editou condomínio',
          item: updated.nome,
          valorAnterior: `Resp: ${prev.responsavelNome} | Salão: R$ ${prev.valorSalaoFestas}`,
          valorNovo: `Resp: ${updated.responsavelNome} | Salão: R$ ${updated.valorSalaoFestas}`
        });

        return updated;
      }
    }

    const newCondo: Condominio = {
      ...condo,
      id: `condo_${Date.now()}`
    };
    list.push(newCondo);
    this.set(STORAGE_KEYS.CONDOMINIOS, list);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Condomínios',
      acao: 'Cadastrou condomínio',
      item: newCondo.nome,
      valorNovo: `Responsável padrão: ${newCondo.responsavelNome}`
    });

    return newCondo;
  }

  public static deleteCondominio(id: string): boolean {
    const list = this.getCondominios();
    const condo = list.find(c => c.id === id);
    if (!condo) return false;

    this.set(STORAGE_KEYS.CONDOMINIOS, list.filter(c => c.id !== id));

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Condomínios',
      acao: 'Excluiu condomínio',
      item: condo.nome
    });

    return true;
  }

  // Tarefas (Section 16 to 26)
  public static getTarefas(): Tarefa[] {
    return this.get<Tarefa[]>(STORAGE_KEYS.TAREFAS, []);
  }

  public static saveTarefa(tarefaData: Omit<Tarefa, 'id' | 'criadoEm'> & { id?: string; criadoEm?: string }): Tarefa {
    const tarefas = this.getTarefas();
    const currentUser = this.getCurrentUser();

    if (tarefaData.id) {
      const idx = tarefas.findIndex(t => t.id === tarefaData.id);
      if (idx >= 0) {
        const prev = tarefas[idx];
        const updated: Tarefa = {
          ...prev,
          ...tarefaData,
          anexos: tarefaData.anexos || prev.anexos,
          checklist: tarefaData.checklist || prev.checklist,
          comentarios: tarefaData.comentarios || prev.comentarios
        };
        tarefas[idx] = updated;
        this.set(STORAGE_KEYS.TAREFAS, tarefas);

        HistoryService.addLog({
          usuarioNome: currentUser.nome,
          usuarioId: currentUser.id,
          modulo: 'Tarefas',
          acao: 'Editou tarefa',
          item: `${updated.condominioNome} — ${updated.titulo}`,
          valorAnterior: prev.status,
          valorNovo: updated.status
        });

        return updated;
      }
    }

    const newTarefa: Tarefa = {
      ...tarefaData,
      id: `task_${Date.now()}`,
      criadoEm: new Date().toISOString().split('T')[0],
      criadoPor: currentUser.nome,
      anexos: tarefaData.anexos || [],
      checklist: tarefaData.checklist || [],
      comentarios: tarefaData.comentarios || []
    };

    tarefas.unshift(newTarefa);
    this.set(STORAGE_KEYS.TAREFAS, tarefas);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Tarefas',
      acao: 'Criou tarefa',
      item: `${newTarefa.condominioNome} — ${newTarefa.titulo}`,
      valorNovo: `Resp: ${newTarefa.responsavelNome} | Prazo: ${newTarefa.prazo}`
    });

    // Notify assignee
    if (newTarefa.responsavelNome !== currentUser.nome && newTarefa.responsavelNome !== 'Não cadastrado') {
      this.addNotificacao({
        titulo: 'Nova tarefa recebida',
        descricao: `${currentUser.nome} atribuiu a você: "${newTarefa.titulo}" no ${newTarefa.condominioNome}.`,
        tipo: 'tarefa',
        linkTab: 'tarefas'
      });
    }

    return newTarefa;
  }

  public static toggleConcluirTarefa(id: string): Tarefa | undefined {
    const tarefas = this.getTarefas();
    const idx = tarefas.findIndex(t => t.id === id);
    if (idx < 0) return undefined;

    const t = tarefas[idx];
    const isNowDone = t.status !== 'Concluída';
    const currentUser = this.getCurrentUser();

    t.status = isNowDone ? 'Concluída' : 'Em andamento';
    t.concluidoEm = isNowDone ? new Date().toLocaleDateString('pt-BR') : undefined;
    t.concluidoPor = isNowDone ? currentUser.nome : undefined;

    tarefas[idx] = t;
    this.set(STORAGE_KEYS.TAREFAS, tarefas);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Tarefas',
      acao: isNowDone ? 'Concluiu tarefa' : 'Reabriu tarefa',
      item: `${t.condominioNome} — ${t.titulo}`
    });

    return t;
  }

  public static deleteTarefa(id: string): boolean {
    const tarefas = this.getTarefas();
    const t = tarefas.find(x => x.id === id);
    if (!t) return false;

    this.set(STORAGE_KEYS.TAREFAS, tarefas.filter(x => x.id !== id));

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Tarefas',
      acao: 'Excluiu tarefa',
      item: `${t.condominioNome} — ${t.titulo}`
    });

    return true;
  }

  public static addComentarioTarefa(tarefaId: string, texto: string): void {
    const tarefas = this.getTarefas();
    const idx = tarefas.findIndex(t => t.id === tarefaId);
    if (idx < 0) return;

    const user = this.getCurrentUser();
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    tarefas[idx].comentarios.push({
      id: `comm_${Date.now()}`,
      autorId: user.id,
      autorNome: user.nome,
      autorAvatar: user.avatar,
      texto,
      dataHora
    });

    this.set(STORAGE_KEYS.TAREFAS, tarefas);

    HistoryService.addLog({
      usuarioNome: user.nome,
      usuarioId: user.id,
      modulo: 'Tarefas',
      acao: 'Comentou na tarefa',
      item: `${tarefas[idx].condominioNome}: "${texto.slice(0, 40)}"`
    });
  }

  // Balancetes & Boletos (Section 27 to 34)
  public static getPeriodos(tipo: 'balancete' | 'boleto'): PeriodoProcesso[] {
    const key = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_PERIODOS : STORAGE_KEYS.BOLETO_PERIODOS;
    return this.get<PeriodoProcesso[]>(key, []);
  }

  public static getProcessoCards(tipo: 'balancete' | 'boleto'): ProcessoCard[] {
    const key = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    return this.get<ProcessoCard[]>(key, []);
  }

  public static createNovoPeriodo(
    tipo: 'balancete' | 'boleto',
    mes: string,
    ano: string,
    condominiosIds: string[]
  ): PeriodoProcesso {
    const periodosKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_PERIODOS : STORAGE_KEYS.BOLETO_PERIODOS;
    const cardsKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;

    const periodos = this.getPeriodos(tipo);
    const existingCards = this.getProcessoCards(tipo);
    const allCondos = this.getCondominios();
    const currentUser = this.getCurrentUser();

    const mesAno = `${mes}/${ano}`;
    const periodoId = `per_${tipo}_${Date.now()}`;

    const newPeriodo: PeriodoProcesso = {
      id: periodoId,
      tipo,
      mes,
      ano,
      mesAno,
      statusGeral: 'Em andamento',
      criadoEm: new Date().toISOString(),
      criadoPor: currentUser.nome
    };

    const checklistLabels = tipo === 'balancete'
      ? ['Anexar', 'Conciliar', 'Analisar', 'Ajustar', 'Enviar']
      : ['Consumos', 'Emissão', 'Análise', 'Ajustes', 'Envio'];

    const newCards: ProcessoCard[] = condominiosIds.map(cid => {
      const condo = allCondos.find(c => c.id === cid) || { id: cid, nome: 'Condomínio', responsavelId: 'unassigned', responsavelNome: 'Não cadastrado' };
      const checklist = checklistLabels.map((lbl, idx) => ({
        id: `chk_${periodoId}_${cid}_${idx + 1}`,
        label: lbl,
        concluido: false
      }));

      return {
        id: `card_${tipo}_${periodoId}_${cid}`,
        periodoId,
        tipoProcesso: tipo,
        condominioId: condo.id,
        condominioNome: condo.nome,
        responsavelId: condo.responsavelId,
        responsavelNome: condo.responsavelNome,
        prazo: `${ano}-10-15`,
        status: 'Pendente',
        checklist,
        informacoesAdicionais: '',
        comentarios: []
      };
    });

    periodos.unshift(newPeriodo);
    this.set(periodosKey, periodos);
    this.set(cardsKey, [...newCards, ...existingCards]);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: tipo === 'balancete' ? 'Balancetes' : 'Boletos',
      acao: `Criou novo período de ${tipo}`,
      item: `${mesAno} com ${newCards.length} condomínios`
    });

    return newPeriodo;
  }

  public static toggleProcessoChecklist(tipo: 'balancete' | 'boleto', cardId: string, checkItemId: string): ProcessoCard | undefined {
    const cardsKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    const cards = this.getProcessoCards(tipo);
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx < 0) return undefined;

    const card = cards[idx];
    const chk = card.checklist.find(i => i.id === checkItemId);
    if (!chk) return undefined;

    const currentUser = this.getCurrentUser();
    const isNowDone = !chk.concluido;
    chk.concluido = isNowDone;

    if (isNowDone) {
      const now = new Date();
      const stamp = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      chk.concluidoPor = currentUser.nome;
      chk.concluidoEm = `${stamp} por ${currentUser.nome}`;
    } else {
      chk.concluidoPor = undefined;
      chk.concluidoEm = undefined;
    }

    const allDone = card.checklist.every(i => i.concluido);
    const anyDone = card.checklist.some(i => i.concluido);

    if (allDone) {
      card.status = 'Concluída';
      card.concluidoEm = new Date().toLocaleDateString('pt-BR');
      card.concluidoPor = currentUser.nome;
    } else if (anyDone) {
      card.status = 'Em andamento';
      card.concluidoEm = undefined;
    } else {
      card.status = 'Pendente';
      card.concluidoEm = undefined;
    }

    cards[idx] = card;
    this.set(cardsKey, cards);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: tipo === 'balancete' ? 'Balancetes' : 'Boletos',
      acao: isNowDone ? `Concluiu etapa "${chk.label}"` : `Desmarcou etapa "${chk.label}"`,
      item: card.condominioNome
    });

    return card;
  }

  public static updateCardInfo(tipo: 'balancete' | 'boleto', cardId: string, info: string): void {
    const cardsKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    const cards = this.getProcessoCards(tipo);
    const card = cards.find(c => c.id === cardId);
    if (card) {
      card.informacoesAdicionais = info;
      this.set(cardsKey, cards);
    }
  }

  public static updateCardResponsavel(tipo: 'balancete' | 'boleto', cardId: string, respId: string, respNome: string): void {
    const cardsKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    const cards = this.getProcessoCards(tipo);
    const card = cards.find(c => c.id === cardId);
    if (card) {
      card.responsavelId = respId;
      card.responsavelNome = respNome;
      this.set(cardsKey, cards);

      HistoryService.addLog({
        usuarioNome: this.getCurrentUser().nome,
        usuarioId: this.getCurrentUserId(),
        modulo: tipo === 'balancete' ? 'Balancetes' : 'Boletos',
        acao: 'Alterou responsável do processo',
        item: `${card.condominioNome} → ${respNome}`
      });
    }
  }

  public static addComentarioCard(tipo: 'balancete' | 'boleto', cardId: string, texto: string): void {
    const cardsKey = tipo === 'balancete' ? STORAGE_KEYS.BALANCETE_CARDS : STORAGE_KEYS.BOLETO_CARDS;
    const cards = this.getProcessoCards(tipo);
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const user = this.getCurrentUser();
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (!card.comentarios) {
      card.comentarios = [];
    }

    card.comentarios.push({
      id: `comm_${Date.now()}`,
      autorId: user.id,
      autorNome: user.nome,
      autorAvatar: user.avatar,
      texto,
      dataHora
    });

    this.set(cardsKey, cards);
  }

  // Xerox (Section 35 & 36)
  public static getXerox(): XeroxRegistro[] {
    return this.get<XeroxRegistro[]>(STORAGE_KEYS.XEROX, []);
  }

  public static saveXerox(registro: Omit<XeroxRegistro, 'id'> & { id?: string }): XeroxRegistro {
    const list = this.getXerox();
    const currentUser = this.getCurrentUser();

    if (registro.id) {
      const idx = list.findIndex(x => x.id === registro.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...registro } as XeroxRegistro;
        this.set(STORAGE_KEYS.XEROX, list);

        HistoryService.addLog({
          usuarioNome: currentUser.nome,
          usuarioId: currentUser.id,
          modulo: 'Xerox',
          acao: 'Editou registro de Xerox',
          item: `${list[idx].condominioNome} (${list[idx].quantidade} cópias)`
        });

        return list[idx];
      }
    }

    const newReg: XeroxRegistro = {
      ...registro,
      id: `xerox_${Date.now()}`
    };
    list.unshift(newReg);
    this.set(STORAGE_KEYS.XEROX, list);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Xerox',
      acao: 'Registrou Xerox',
      item: `${newReg.condominioNome} — ${newReg.quantidade} cópias = R$ ${newReg.valorTotal.toFixed(2).replace('.', ',')}`
    });

    return newReg;
  }

  public static deleteXerox(id: string): boolean {
    const list = this.getXerox();
    const item = list.find(x => x.id === id);
    if (!item) return false;

    this.set(STORAGE_KEYS.XEROX, list.filter(x => x.id !== id));

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Xerox',
      acao: 'Excluiu registro de Xerox',
      item: `${item.condominioNome} (${item.quantidade} cópias)`
    });

    return true;
  }

  // Assembleias (Section 37, 38, 39)
  public static getAssembleias(): Assembleia[] {
    return this.get<Assembleia[]>(STORAGE_KEYS.ASSEMBLEIAS, []);
  }

  public static saveAssembleia(data: Omit<Assembleia, 'id'> & { id?: string }): Assembleia {
    const list = this.getAssembleias();
    const currentUser = this.getCurrentUser();

    if (data.id) {
      const idx = list.findIndex(a => a.id === data.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data } as Assembleia;
        this.set(STORAGE_KEYS.ASSEMBLEIAS, list);

        HistoryService.addLog({
          usuarioNome: currentUser.nome,
          usuarioId: currentUser.id,
          modulo: 'Assembleias',
          acao: 'Editou assembleia',
          item: `${list[idx].condominioNome} (${list[idx].data})`
        });

        return list[idx];
      }
    }

    const newAss: Assembleia = {
      ...data,
      id: `assemb_${Date.now()}`
    };
    list.unshift(newAss);
    this.set(STORAGE_KEYS.ASSEMBLEIAS, list);

    HistoryService.addLog({
      usuarioNome: currentUser.nome,
      usuarioId: currentUser.id,
      modulo: 'Assembleias',
      acao: 'Cadastrou assembleia',
      item: `${newAss.condominioNome} em ${newAss.data} às ${newAss.horario}`
    });

    return newAss;
  }

  public static deleteAssembleia(id: string): boolean {
    const list = this.getAssembleias();
    const item = list.find(a => a.id === id);
    if (!item) return false;

    this.set(STORAGE_KEYS.ASSEMBLEIAS, list.filter(a => a.id !== id));

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Assembleias',
      acao: 'Excluiu assembleia',
      item: `${item.condominioNome} (${item.data})`
    });

    return true;
  }

  // Chat Geral (Section 48)
  public static getChatGeral(): ChatMessage[] {
    return this.get<ChatMessage[]>(STORAGE_KEYS.CHAT_GERAL, []);
  }

  public static sendChatMessage(texto: string): ChatMessage {
    const list = this.getChatGeral();
    const user = this.getCurrentUser();
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const msg: ChatMessage = {
      id: `chat_${Date.now()}`,
      autorId: user.id,
      autorNome: user.nome,
      autorAvatar: user.avatar,
      autorRole: user.cargo,
      texto,
      dataHora
    };

    list.push(msg);
    this.set(STORAGE_KEYS.CHAT_GERAL, list);
    return msg;
  }

  // Notificações (Section 49)
  public static getNotificacoes(): Notificacao[] {
    return this.get<Notificacao[]>(STORAGE_KEYS.NOTIFICACOES, []);
  }

  public static addNotificacao(n: Omit<Notificacao, 'id' | 'criadaEm' | 'lida'>): void {
    const list = this.getNotificacoes();
    list.unshift({
      ...n,
      id: `notif_${Date.now()}`,
      lida: false,
      criadaEm: 'Agora mesmo'
    });
    this.set(STORAGE_KEYS.NOTIFICACOES, list);
  }

  public static markNotificacaoAsRead(id: string): void {
    const list = this.getNotificacoes();
    const item = list.find(n => n.id === id);
    if (item) {
      item.lida = true;
      this.set(STORAGE_KEYS.NOTIFICACOES, list);
    }
  }

  public static markAllNotificacoesAsRead(): void {
    const list = this.getNotificacoes();
    list.forEach(n => (n.lida = true));
    this.set(STORAGE_KEYS.NOTIFICACOES, list);
  }

  // Identidade & Config (Section 7, 35, 52)
  public static getIdentidade(): IdentidadeConfig {
    return this.get<IdentidadeConfig>(STORAGE_KEYS.IDENTIDADE, INITIAL_IDENTIDADE);
  }

  public static saveIdentidade(config: IdentidadeConfig): void {
    const prev = this.getIdentidade();
    this.set(STORAGE_KEYS.IDENTIDADE, config);

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Identidade',
      acao: 'Atualizou configurações de identidade e valores',
      item: config.nomeSistema,
      valorAnterior: `Xerox P&B: R$ ${prev.precoXeroxPreto}`,
      valorNovo: `Xerox P&B: R$ ${config.precoXeroxPreto}`
    });
  }

  public static updateLogo(logoBase64: string): void {
    const config = this.getIdentidade();
    config.logoUrl = logoBase64;
    this.set(STORAGE_KEYS.IDENTIDADE, config);

    HistoryService.addLog({
      usuarioNome: this.getCurrentUser().nome,
      usuarioId: this.getCurrentUserId(),
      modulo: 'Identidade',
      acao: logoBase64 ? 'Adicionou / substituiu logo da empresa' : 'Removeu logo da empresa',
      item: 'Logotipo PULSO95'
    });
  }

  public static getTheme(): 'dark' | 'light' {
    return this.get<'dark' | 'light'>(STORAGE_KEYS.THEME, 'dark');
  }

  public static setTheme(theme: 'dark' | 'light'): void {
    this.set(STORAGE_KEYS.THEME, theme);
  }
}
