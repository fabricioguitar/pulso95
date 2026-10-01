import { getSupabaseClient } from '../lib/supabase';

export interface ArquivoItem {
  id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  mimeType?: string;
  modulo?: string;
  registroId?: string;
  bucket: string;
  caminho: string;
  url?: string;
  criadoEm?: string;
}

export class ArquivoService {
  private static BUCKET_NAME = 'pulso95';

  /**
   * Upload file to Supabase Storage and register in public.arquivos
   */
  public static async uploadArquivo(
    file: File,
    modulo: string = 'geral',
    registroId?: string
  ): Promise<{ success: boolean; data?: ArquivoItem; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase não conectado.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID().substring(0, 8)}.${fileExt}`;
    const filePath = `${modulo}/${fileName}`;

    try {
      // 1. Upload to Storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[ArquivoService] Erro no upload para storage:', uploadError.message);
        return { success: false, error: uploadError.message };
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl || '';
      const arquivoId = crypto.randomUUID();

      // 3. Register in public.arquivos table
      const dbPayload = {
        id: arquivoId,
        nome: file.name,
        descricao: `${modulo} arquivo`,
        tipo: fileExt || 'bin',
        mime_type: file.type || 'application/octet-stream',
        modulo,
        registro_id: registroId || null,
        bucket: this.BUCKET_NAME,
        caminho: filePath
      };

      await supabase.from('arquivos').insert(dbPayload);

      return {
        success: true,
        data: {
          id: arquivoId,
          nome: file.name,
          bucket: this.BUCKET_NAME,
          caminho: filePath,
          url: publicUrl,
          modulo,
          registroId
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro inesperado no upload.' };
    }
  }

  /**
   * Get arquivos by modulo and registroId
   */
  public static async getArquivos(modulo?: string, registroId?: string): Promise<ArquivoItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      let query = supabase.from('arquivos').select('*').order('created_at', { ascending: false });

      if (modulo) query = query.eq('modulo', modulo);
      if (registroId) query = query.eq('registro_id', registroId);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(row => {
        const { data: urlData } = supabase.storage
          .from(row.bucket || this.BUCKET_NAME)
          .getPublicUrl(row.caminho);

        return {
          id: row.id,
          nome: row.nome,
          descricao: row.descricao,
          tipo: row.tipo,
          mimeType: row.mime_type,
          modulo: row.modulo,
          registroId: row.registro_id,
          bucket: row.bucket,
          caminho: row.caminho,
          url: urlData?.publicUrl,
          criadoEm: row.created_at
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Delete arquivo from Storage and Database
   */
  public static async deleteArquivo(id: string, bucket = this.BUCKET_NAME, caminho?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      if (caminho) {
        await supabase.storage.from(bucket).remove([caminho]);
      }
      const { error } = await supabase.from('arquivos').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }
}
