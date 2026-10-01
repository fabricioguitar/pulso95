import { DiscordConfig, Tarefa } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { StorageService } from './storageService';

const STORAGE_KEY = 'pulso95_discord_config';

export const INITIAL_DISCORD_CONFIG: DiscordConfig = {
  conectado: false,
  webhookUrl: '',
  servidor: 'PULSO95 Operacional',
  canal: '#avisos-tarefas',
  statusTexto: '🔴 Não conectado'
};

export class DiscordService {
  public static getConfig(): DiscordConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DISCORD_CONFIG;
      return JSON.parse(data) as DiscordConfig;
    } catch {
      return INITIAL_DISCORD_CONFIG;
    }
  }

  public static saveConfig(config: DiscordConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  public static disconnect(): DiscordConfig {
    const config: DiscordConfig = {
      ...this.getConfig(),
      conectado: false,
      statusTexto: '🔴 Não conectado'
    };
    this.saveConfig(config);
    return config;
  }

  public static testConnection(): { success: boolean; message: string } {
    const config = this.getConfig();
    if (!config.webhookUrl) {
      return {
        success: false,
        message: 'Por favor, informe a URL do Webhook do Discord antes de testar.'
      };
    }
    return {
      success: true,
      message: 'Teste simulado realizado com sucesso. Webhook pronto para envio.'
    };
  }

  public static formatTaskCreatedMessage(tarefa: Tarefa, autor: string): string {
    const prazoFormatado = tarefa.prazo.split('-').reverse().join('/');
    return `📋 **NOVA TAREFA**\n**Condomínio:** ${tarefa.condominioNome}\n**Tarefa:** ${tarefa.titulo}\n**Responsável:** ${tarefa.responsavelNome}\n**Prazo:** ${prazoFormatado}\n**Prioridade:** ${tarefa.prioridade}\n**Criado por:** ${autor}\n*PULSO95 — Gestão inteligente de processos*`;
  }

  public static async notifyNewTaskAsync(tarefa: Tarefa, autor: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const users = StorageService.getUsers();
      const responsavel = users.find(u => u.id === tarefa.responsavelId);
      const discordId = responsavel?.discordId || null;

      if (!discordId) {
        return { success: true, message: `Notificação do Discord não enviada pois o usuário ${tarefa.responsavelNome} não possui Discord ID configurado.` };
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase cliente não inicializado. Não é possível notificar via Edge Function.' };
      }

      const { data, error } = await supabase.functions.invoke('notify-discord', {
        body: { tarefa, autor, discordId }
      });

      if (error) {
        console.error('[DiscordService] Erro ao chamar Edge Function:', error.message);
        return { success: false, error: error.message };
      }

      if (data && data.message) {
         return { success: true, message: data.message };
      }

      return { success: true, message: 'Notificação enviada ao Discord com sucesso!' };
    } catch (err: any) {
      console.error('[DiscordService] Exceção ao notificar Discord:', err);
      return { success: false, error: err.message };
    }
  }

  // Mantendo o antigo apenas por compatibilidade caso seja usado em outros lugares
  public static notifyNewTask(tarefa: Tarefa, autor: string): { simulated: boolean; message: string } {
    const config = this.getConfig();
    if (config.conectado && config.webhookUrl) {
      return {
        simulated: true,
        message: 'Mensagem preparada para o Discord (Canal: ' + config.canal + '): ' + tarefa.titulo
      };
    }

    return {
      simulated: false,
      message: 'Discord não configurado.'
    };
  }
}
