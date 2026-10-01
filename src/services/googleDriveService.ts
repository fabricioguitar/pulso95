import { GoogleDriveConfig } from '../types';

const STORAGE_KEY = 'pulso95_google_drive_config';

export const INITIAL_DRIVE_CONFIG: GoogleDriveConfig = {
  conectado: false,
  emailConta: 'administracao@pulso95.com.br',
  pastaPrincipal: 'PULSO95',
  statusTexto: '🔴 Desconectado'
};

export class GoogleDriveService {
  public static getConfig(): GoogleDriveConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DRIVE_CONFIG;
      return JSON.parse(data) as GoogleDriveConfig;
    } catch {
      return INITIAL_DRIVE_CONFIG;
    }
  }

  public static saveConfig(config: GoogleDriveConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  public static connect(email: string, pastaPrincipal: string): { success: boolean; message: string; config: GoogleDriveConfig } {
    const config: GoogleDriveConfig = {
      conectado: true,
      emailConta: email,
      pastaPrincipal: pastaPrincipal || 'PULSO95',
      statusTexto: '🟢 Preparado (Ambiente Local)'
    };
    this.saveConfig(config);
    return {
      success: true,
      message: 'Integração preparada. A conexão real será ativada quando as credenciais/API OAuth forem configuradas em produção.',
      config
    };
  }

  public static disconnect(): GoogleDriveConfig {
    const config: GoogleDriveConfig = {
      ...this.getConfig(),
      conectado: false,
      statusTexto: '🔴 Desconectado'
    };
    this.saveConfig(config);
    return config;
  }
}
