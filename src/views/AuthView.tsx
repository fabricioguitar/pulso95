import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { User, IdentidadeConfig } from '../types';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';

interface AuthViewProps {
  identidade: IdentidadeConfig;
  onLoginSuccess: (user: User) => void;
  onToast: (tipo: 'success' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  identidade,
  onLoginSuccess,
  onToast
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCargo, setRegCargo] = useState('Colaborador Administrativo');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Google Modal
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');

  // Loading & Error feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setErrorMessage('Por favor, informe seu e-mail.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await AuthService.signIn(email, loginPassword);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        onLoginSuccess(res.user);
        onToast('success', `Bem-vindo de volta, ${res.user.nome}!`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await AuthService.signUp(
        regEmail.trim(),
        regPassword || 'Pulso95@2026',
        regName.trim(),
        regCargo.trim() || 'Colaborador'
      );

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        onLoginSuccess(res.user);
        onToast(
          res.user.status === 'ativo' ? 'success' : 'info',
          res.user.status === 'ativo' ? 'Acesso Master liberado!' : 'Cadastro realizado com sucesso.',
          res.user.status === 'ativo' ? undefined : 'Seu acesso está aguardando aprovação do administrador.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!forgotEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      setIsLoading(false);
      return;
    }

    const res = await AuthService.resetPassword(forgotEmail.trim());
    setIsLoading(false);
    if (res.success) {
      setForgotSent(true);
      onToast('success', 'E-mail de recuperação enviado!', 'Verifique sua caixa de entrada.');
    } else {
      setErrorMessage(res.error || 'Não foi possível enviar o e-mail de recuperação.');
    }
  };

  // Google OAuth Flow Real
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const res = await AuthService.signInWithGoogle();
    if (res.error) {
      setIsLoading(false);
      setErrorMessage(`Google OAuth: ${res.error}. Verifique se o provider Google está habilitado no Supabase.`);
    }
  };

  // Google Account Select Modal Handler
  const handleGoogleAuthSelect = async (name: string, email: string, cargo = 'Colaborador') => {
    setIsGoogleModalOpen(false);
    const res = await AuthService.signUp(email, 'GoogleAuth@2026', name, cargo);
    if (res.user) {
      onLoginSuccess(res.user);
      onToast(
        res.user.status === 'ativo' ? 'success' : 'info',
        res.user.status === 'ativo' ? 'Acesso liberado!' : 'Cadastro realizado com sucesso.',
        res.user.status === 'ativo' ? undefined : 'Seu acesso está aguardando aprovação do administrador.'
      );
    } else {
      setErrorMessage(res.error || 'Erro na autenticação.');
    }
  };

  // Quick Login as Master (Dev shortcut)
  const handleLoginAsMaster = () => {
    const master = StorageService.getUsers().find(u => u.role === 'master') || StorageService.getCurrentUser();
    StorageService.setCurrentUserId(master.id);
    StorageService.setSessionActive(true);
    onLoginSuccess(master);
    onToast('success', 'Acesso Master ativo!', `Conectado como ${master.nome}.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070B18] text-slate-100 relative overflow-hidden select-none">
      {/* Background Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 shadow-xl shadow-blue-600/20 mb-1 border border-white/10">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{identidade.nomeSistema || 'PULSO95'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest font-mono">
              v1.0
            </span>
          </h1>

          <p className="text-xs text-slate-400 font-medium">
            {identidade.subtitulo || 'Gestão inteligente de processos'}
          </p>

          {/* Brand Stamp */}
          <div className="pt-1 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-800">
              PULSO95 GESTÃO
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1326]/90 backdrop-blur-xl border border-[#1E293B] shadow-2xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#070B18] border border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar uma conta
            </button>
          </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Conectando...' : 'Continuar com Google'}</span>
            </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0D1326] px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              ou com e-mail
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: ENTRAR */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="fabricio@pulso95.com.br"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Senha
                  </label>
                  <span
                    onClick={() => {
                      setTab('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Esqueceu?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 pt-2.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Autenticando via Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: ESQUECI A SENHA */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recuperação de Senha</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Informe o e-mail cadastrado no Supabase para receber as instruções de redefinição.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="font-semibold">E-mail de recuperação enviado!</p>
                  <p className="text-[11px] text-slate-300">
                    Acesse sua caixa de entrada para definir sua nova senha.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setForgotSent(false);
                    }}
                    className="mt-2 text-xs font-bold text-blue-400 hover:underline block mx-auto"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Seu E-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="fabricio@pulso95.com.br"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enviando link...</span>
                      </>
                    ) : (
                      <span>Enviar Link de Recuperação</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMessage('');
                    }}
                    className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Voltar para o Login
                  </button>
                </>
              )}
            </form>
          )}

          {/* TAB 2: CRIAR UMA CONTA */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="joao@pulso95.com.br"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cargo / Função pretendida
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ex: Assistente Administrativo"
                    value={regCargo}
                    onChange={e => setRegCargo(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Defina uma Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                ℹ️ <strong>Cadastro Real:</strong> O registro é enviado diretamente ao Supabase Auth e gravado em <code>public.profiles</code> com status <strong>ativo</strong>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>Solicitar Cadastro no Supabase</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>


      {/* Google Account Picker Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D1326] border border-[#1E293B] shadow-2xl p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Escolha uma conta Google</h3>
              <p className="text-xs text-slate-400">para continuar no PULSO95</p>
            </div>

            <div className="space-y-2 divide-y divide-slate-800/60">
              {/* Account 1: Master Fabrício */}
              <button
                type="button"
                onClick={() => handleGoogleAuthSelect('Fabrício', 'fabricioguitar82@gmail.com', 'Master / Administrador')}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    F
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Fabrício</span>
                    <span className="text-[11px] text-slate-400 block">fabricioguitar82@gmail.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Master
                </span>
              </button>

              {/* Account 2: Custom / New User */}
              <div className="pt-3 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Ou entrar com outro e-mail Google:
                </span>
                <input
                  type="text"
                  placeholder="Nome (Ex: Mariana)"
                  value={googleCustomName}
                  onChange={e => setGoogleCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
                <input
                  type="email"
                  placeholder="E-mail (Ex: mariana@gmail.com)"
                  value={googleCustomEmail}
                  onChange={e => setGoogleCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  disabled={!googleCustomName.trim() || !googleCustomEmail.trim()}
                  onClick={() => handleGoogleAuthSelect(googleCustomName, googleCustomEmail, 'Colaborador')}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  Continuar com esta conta
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
