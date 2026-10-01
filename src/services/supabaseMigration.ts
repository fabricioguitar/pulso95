import { StorageService } from './storageService';
import {
  SupabaseCondominiosService,
  SupabaseTarefasService,
  SupabaseBalancetesService,
  SupabaseBoletosService,
  SupabaseXeroxService,
  SupabaseAssembleiasService
} from './supabase';
import { getSupabaseClient } from '../lib/supabase';

export interface MigrationProgress {
  step: string;
  total: number;
  current: number;
  success: boolean;
  message: string;
}

export class SupabaseMigrationService {
  /**
   * Migrates all current local data (from LocalStorage) into the connected Supabase database
   */
  public static async migrateAllLocalData(onProgress?: (p: MigrationProgress) => void): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase não está configurado. Conecte primeiro.' };
    }

    try {
      // 1. Migrar Usuários
      onProgress?.({ step: 'Usuários', total: 1, current: 0, success: true, message: 'Enviando usuários...' });
      const users = StorageService.getUsers();
      for (const u of users) {
        await supabase.from('usuarios').upsert({
          id: u.id,
          nome: u.nome,
          email: u.email,
          cargo: u.cargo,
          role: u.role,
          status: u.status,
          avatar: u.avatar || '',
          criado_em: u.criadoEm,
          aprovado_por: u.aprovadoPor,
          aprovado_em: u.aprovadoEm,
          permissoes: u.permissoes
        });
      }

      // 2. Migrar Condomínios (todos os 54)
      const condos = StorageService.getCondominios();
      onProgress?.({ step: 'Condomínios', total: condos.length, current: 0, success: true, message: `Enviando ${condos.length} condomínios...` });
      await SupabaseCondominiosService.seedCondominios(condos);

      // 3. Migrar Tarefas
      const tarefas = StorageService.getTarefas();
      onProgress?.({ step: 'Tarefas', total: tarefas.length, current: 0, success: true, message: `Enviando ${tarefas.length} tarefas...` });
      for (const t of tarefas) {
        await SupabaseTarefasService.saveTarefa(t);
      }

      // 4. Migrar Balancetes
      const balancetePeriodos = StorageService.getPeriodos('balancete');
      for (const p of balancetePeriodos) {
        await supabase.from('balancete_periodos').upsert({
          id: p.id,
          mes_ano: p.mesAno,
          aberto: p.statusGeral !== 'Concluída',
          criado_em: p.criadoEm
        });
      }
      const balanceteCards = StorageService.getProcessoCards('balancete');
      for (const c of balanceteCards) {
        await SupabaseBalancetesService.saveCard(c);
      }

      // 5. Migrar Boletos
      const boletoPeriodos = StorageService.getPeriodos('boleto');
      for (const p of boletoPeriodos) {
        await supabase.from('boleto_periodos').upsert({
          id: p.id,
          mes_ano: p.mesAno,
          aberto: p.statusGeral !== 'Concluída',
          criado_em: p.criadoEm
        });
      }
      const boletoCards = StorageService.getProcessoCards('boleto');
      for (const c of boletoCards) {
        await SupabaseBoletosService.saveCard(c);
      }

      // 6. Migrar Xerox
      const xerox = StorageService.getXerox();
      for (const x of xerox) {
        await SupabaseXeroxService.saveRegistro(x);
      }

      // 7. Migrar Assembleias
      const assembleias = StorageService.getAssembleias();
      for (const a of assembleias) {
        await SupabaseAssembleiasService.saveAssembleia(a);
      }

      onProgress?.({ step: 'Concluído', total: 100, current: 100, success: true, message: 'Migração finalizada com sucesso!' });

      return {
        success: true,
        message: `Migração concluída com sucesso! ${condos.length} condomínios, ${tarefas.length} tarefas e processos salvos no Supabase.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Erro durante a migração: ${err?.message || String(err)}`
      };
    }
  }
}
