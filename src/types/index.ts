export type UserRole = 'master' | 'colaborador';
export type UserStatus = 'ativo' | 'pendente' | 'bloqueado';

export interface UserPermissions {
  modulosPermitidos: string[]; // e.g. ['inicio', 'tarefas', 'condominios', 'balancetes', 'boletos', 'xerox', 'assembleias', 'chat', 'indicadores', 'historico', 'configuracoes']
  podeCriarTarefas?: boolean;
  podeEditarCondominios?: boolean;
  podeGerenciarXerox?: boolean;
  podeGerenciarAssembleias?: boolean;
}

export interface User {
  id: string;
  nome: string;
  cargo: string;
  role: UserRole;
  avatar?: string; // base64 or empty
  email: string;
  discordId?: string;
  status: UserStatus;
  permissoes?: UserPermissions;
  criadoEm?: string;
  aprovadoPor?: string;
  aprovadoEm?: string;
  motivoBloqueio?: string;
}

export interface Condominio {
  id: string;
  nome: string;
  responsavelId: string;
  responsavelNome: string; // e.g. "Fabrício" or "Não cadastrado"
  valorSalaoFestas: number;
  valorChurrasqueira: number;
  valorMultaLeve: number;
  valorMultaMedia: number;
  valorMultaGrave: number;
  unidades?: number;
  endereco?: string;
}

export type TaskType = 'Multa' | 'Salão de festas' | 'Churrasqueira' | 'Tarefa geral' | 'Outro';
export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type TaskStatus = 'Pendente' | 'Em andamento' | 'Concluída' | 'Atrasada';
export type GravidadeMulta = 'Leve' | 'Média' | 'Grave';

export interface TaskAttachment {
  id: string;
  nome: string;
  tamanho: string;
  tipo: string;
  data: string;
  autorNome: string;
  dataUrl?: string;
}

export interface TaskChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  concluidoPor?: string;
  concluidoEm?: string;
}

export interface TaskComment {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar?: string;
  texto: string;
  dataHora: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  condominioId: string;
  condominioNome: string;
  tipo: TaskType;
  gravidade?: GravidadeMulta;
  valorCalculado?: number;
  responsavelId: string;
  responsavelNome: string;
  prazo: string; // YYYY-MM-DD
  prioridade: TaskPriority;
  status: TaskStatus;
  informacoesAdicionais: string;
  anexos: TaskAttachment[];
  checklist: TaskChecklistItem[];
  comentarios: TaskComment[];
  criadoEm: string;
  criadoPor: string;
  concluidoEm?: string;
  concluidoPor?: string;
}

export interface ProcessoChecklistItem {
  id: string;
  label: string;
  concluido: boolean;
  concluidoPor?: string;
  concluidoEm?: string;
}

export interface ProcessoCard {
  id: string;
  periodoId: string;
  tipoProcesso: 'balancete' | 'boleto';
  condominioId: string;
  condominioNome: string;
  responsavelId: string;
  responsavelNome: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída' | 'Atrasada';
  checklist: ProcessoChecklistItem[];
  informacoesAdicionais: string;
  comentarios: TaskComment[];
  concluidoEm?: string;
  concluidoPor?: string;
}

export interface PeriodoProcesso {
  id: string;
  tipo: 'balancete' | 'boleto';
  mes: string;
  ano: string;
  mesAno: string;
  statusGeral: 'Em andamento' | 'Concluída';
  criadoEm: string;
  criadoPor: string;
}

export interface XeroxRegistro {
  id: string;
  condominioId: string;
  condominioNome: string;
  data: string;
  tipo: 'preto_branco' | 'colorida';
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  informacoesAdicionais: string;
  registradoPor: string;
}

export interface Assembleia {
  id: string;
  condominioId: string;
  condominioNome: string;
  data: string;
  horario: string;
  editalTexto?: string;
  editalArquivo?: TaskAttachment;
  boletoArquivo?: TaskAttachment;
  informacoesBoleto?: string;
  emailsAdicionais?: string;
  observacoes?: string;
  status: 'agendada' | 'realizada' | 'cancelada';
}

export interface ChatMessage {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar?: string;
  autorRole: string;
  texto: string;
  dataHora: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'tarefa' | 'mencao' | 'prazo' | 'atraso' | 'chat' | 'balancete' | 'sistema';
  lida: boolean;
  criadaEm: string;
  linkTab?: string;
}

export interface HistoricoItem {
  id: string;
  usuarioNome: string;
  usuarioId: string;
  dataHora: string;
  modulo: 'Tarefas' | 'Condomínios' | 'Balancetes' | 'Boletos' | 'Xerox' | 'Assembleias' | 'Identidade' | 'Usuários' | 'Integrações';
  acao: string;
  item: string;
  valorAnterior?: string;
  valorNovo?: string;
}

export interface GoogleDriveConfig {
  conectado: boolean;
  emailConta: string;
  pastaPrincipal: string;
  statusTexto: string;
}

export interface DiscordConfig {
  conectado: boolean;
  webhookUrl: string;
  servidor: string;
  canal: string;
  statusTexto: string;
}

export interface IdentidadeConfig {
  nomeSistema: string;
  subtitulo: string;
  logoUrl?: string; // base64 or empty
  corPrincipal: string;
  corSecundaria: string;
  temaPadrao: 'dark' | 'light';
  precoXeroxPreto: number;
  precoXeroxColorida: number;
}
