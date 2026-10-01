// Complete SQL Schema string for the PULSO95 Supabase project
export const FULL_SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- PULSO95 — Esquema Completo do Banco de Dados para o Supabase
-- Execute este script no SQL Editor do seu projeto Supabase (PULSO95)
-- ====================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'Colaborador',
  role TEXT NOT NULL DEFAULT 'colaborador' CHECK (role IN ('master', 'colaborador')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'pendente', 'bloqueado')),
  avatar TEXT DEFAULT '',
  criado_em TEXT DEFAULT to_char(now(), 'DD/MM/YYYY'),
  aprovado_por TEXT,
  aprovado_em TEXT,
  motivo_bloqueio TEXT,
  permissoes JSONB DEFAULT '{"modulosPermitidos": ["inicio", "tarefas", "condominios", "balancetes", "boletos", "xerox", "assembleias", "chat", "indicadores"]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Usuário Master Único (Fabrício)
INSERT INTO public.usuarios (id, nome, email, cargo, role, status, criado_em, permissoes)
VALUES (
  'user_fabricio',
  'Fabrício',
  'fabricioguitar82@gmail.com',
  'Master / Administrador',
  'master',
  'ativo',
  to_char(now(), 'DD/MM/YYYY'),
  '{"modulosPermitidos": ["inicio", "tarefas", "condominios", "balancetes", "boletos", "xerox", "assembleias", "chat", "indicadores", "historico", "configuracoes"], "podeCriarTarefas": true, "podeEditarCondominios": true, "podeGerenciarXerox": true, "podeGerenciarAssembleias": true}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  role = 'master',
  status = 'ativo',
  cargo = 'Master / Administrador';

-- 3. Tabela: condominios
CREATE TABLE IF NOT EXISTS public.condominios (
  id TEXT PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  responsavel_id TEXT DEFAULT 'user_fabricio',
  responsavel_nome TEXT DEFAULT 'Fabrício',
  valor_salao_festas NUMERIC(10,2) DEFAULT 0,
  valor_churrasqueira NUMERIC(10,2) DEFAULT 0,
  valor_multa_leve NUMERIC(10,2) DEFAULT 0,
  valor_multa_media NUMERIC(10,2) DEFAULT 0,
  valor_multa_grave NUMERIC(10,2) DEFAULT 0,
  unidades INTEGER,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela: tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'Tarefa geral',
  prioridade TEXT NOT NULL DEFAULT 'Média',
  status TEXT NOT NULL DEFAULT 'Pendente',
  condominio_id TEXT REFERENCES public.condominios(id) ON DELETE SET NULL,
  condominio_nome TEXT NOT NULL,
  responsavel_id TEXT,
  responsavel_nome TEXT NOT NULL DEFAULT 'Fabrício',
  data_prazo TEXT,
  criada_em TEXT,
  criada_por TEXT NOT NULL DEFAULT 'Fabrício',
  concluida_em TEXT,
  concluida_por TEXT,
  gravidade_multa TEXT,
  valor_multa NUMERIC(10,2),
  valor_espaco NUMERIC(10,2),
  anexos JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  comentarios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabelas: Processos Balancetes
CREATE TABLE IF NOT EXISTS public.balancete_periodos (
  id TEXT PRIMARY KEY,
  mes_ano TEXT NOT NULL,
  aberto BOOLEAN DEFAULT true,
  criado_em TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.balancete_cards (
  id TEXT PRIMARY KEY,
  periodo_id TEXT REFERENCES public.balancete_periodos(id) ON DELETE CASCADE,
  condominio_id TEXT REFERENCES public.condominios(id) ON DELETE CASCADE,
  condominio_nome TEXT NOT NULL,
  responsavel_id TEXT,
  responsavel_nome TEXT NOT NULL DEFAULT 'Fabrício',
  etapa TEXT NOT NULL DEFAULT 'A Iniciar',
  checklist JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  comentarios JSONB DEFAULT '[]'::jsonb,
  concluido_em TEXT,
  concluida_por TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabelas: Processos Boletos
CREATE TABLE IF NOT EXISTS public.boleto_periodos (
  id TEXT PRIMARY KEY,
  mes_ano TEXT NOT NULL,
  aberto BOOLEAN DEFAULT true,
  criado_em TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.boleto_cards (
  id TEXT PRIMARY KEY,
  periodo_id TEXT REFERENCES public.boleto_periodos(id) ON DELETE CASCADE,
  condominio_id TEXT REFERENCES public.condominios(id) ON DELETE CASCADE,
  condominio_nome TEXT NOT NULL,
  responsavel_id TEXT,
  responsavel_nome TEXT NOT NULL DEFAULT 'Fabrício',
  etapa TEXT NOT NULL DEFAULT 'A Iniciar',
  checklist JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  comentarios JSONB DEFAULT '[]'::jsonb,
  concluido_em TEXT,
  concluida_por TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabela: xerox_registros
CREATE TABLE IF NOT EXISTS public.xerox_registros (
  id TEXT PRIMARY KEY,
  condominio_id TEXT REFERENCES public.condominios(id) ON DELETE SET NULL,
  condominio_nome TEXT NOT NULL,
  quantidade_pb INTEGER DEFAULT 0,
  quantidade_colorida INTEGER DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  cobrado_em_boleto BOOLEAN DEFAULT false,
  periodo_boleto TEXT,
  solicitante TEXT,
  criado_em TEXT,
  criado_por TEXT NOT NULL DEFAULT 'Fabrício',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabela: assembleias
CREATE TABLE IF NOT EXISTS public.assembleias (
  id TEXT PRIMARY KEY,
  condominio_id TEXT REFERENCES public.condominios(id) ON DELETE CASCADE,
  condominio_nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'AGO',
  data_hora TEXT NOT NULL,
  local TEXT,
  pauta JSONB DEFAULT '[]'::jsonb,
  edital_enviado BOOLEAN DEFAULT false,
  edital_data_envio TEXT,
  ata_redigida BOOLEAN DEFAULT false,
  ata_registrada BOOLEAN DEFAULT false,
  ata_enviada_aos_condominos BOOLEAN DEFAULT false,
  observacoes TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabela: mensagens_chat
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
  id TEXT PRIMARY KEY,
  remetente_id TEXT NOT NULL,
  remetente_nome TEXT NOT NULL,
  remetente_avatar TEXT,
  conteudo TEXT NOT NULL,
  criada_em TEXT,
  criada_em_iso TIMESTAMPTZ DEFAULT now(),
  anexo_nome TEXT,
  anexo_url TEXT
);

-- 10. Tabela: notificacoes
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'sistema',
  lida BOOLEAN DEFAULT false,
  link_tab TEXT,
  criada_em TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Tabela: historico_logs
CREATE TABLE IF NOT EXISTS public.historico_logs (
  id TEXT PRIMARY KEY,
  timestamp BIGINT,
  timestamp_iso TIMESTAMPTZ DEFAULT now(),
  data_hora_formatada TEXT,
  usuario_id TEXT,
  usuario_nome TEXT NOT NULL,
  modulo TEXT NOT NULL,
  acao TEXT NOT NULL,
  item TEXT,
  detalhes TEXT
);

-- 12. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balancete_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balancete_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boleto_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boleto_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xerox_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Permissivo para a Chave Anon
CREATE POLICY "Acesso anon usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon condominios" ON public.condominios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon tarefas" ON public.tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon balancete_periodos" ON public.balancete_periodos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon balancete_cards" ON public.balancete_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon boleto_periodos" ON public.boleto_periodos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon boleto_cards" ON public.boleto_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon xerox_registros" ON public.xerox_registros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon assembleias" ON public.assembleias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon mensagens_chat" ON public.mensagens_chat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon notificacoes" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso anon historico_logs" ON public.historico_logs FOR ALL USING (true) WITH CHECK (true);

-- Habilitar Realtime para Chat e Notificações no Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
`;
