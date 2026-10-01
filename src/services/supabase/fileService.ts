import { getSupabaseClient } from '../../lib/supabase';

export class SupabaseFileService {
  private static BUCKET_NAME = 'pulso95-arquivos';

  /**
   * Uploads a file (attachment, logo, avatar, edital) to Supabase Storage
   */
  public static async uploadFile(
    file: File | Blob,
    path: string,
    bucket = SupabaseFileService.BUCKET_NAME
  ): Promise<{ url: string; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { url: '', error: 'Supabase não inicializado' };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { url: '', error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl };
    } catch (err: any) {
      return { url: '', error: err.message || 'Falha no upload' };
    }
  }

  /**
   * Removes a file from Supabase Storage
   */
  public static async deleteFile(path: string, bucket = SupabaseFileService.BUCKET_NAME): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  }
}
