import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Upload foto menu ke Supabase Storage, bucket `menu-images`.
 *
 * PENTING: bucket ini harus dibuat manual dulu di dashboard Supabase
 * (Storage > New bucket > nama "menu-images" > toggle "Public bucket"
 * ON), plus tambahkan storage policy-nya -- lihat
 * SETUP_SUPABASE_XENDIT.md bagian "Storage untuk Foto Menu".
 */
export async function uploadMenuImage(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.');
  }

  const extension = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    if (uploadError.message.toLowerCase().includes('bucket not found')) {
      throw new Error(
        'Bucket "menu-images" belum dibuat di Supabase Storage. Lihat SETUP_SUPABASE_XENDIT.md bagian Storage.'
      );
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName);
  return data.publicUrl;
}
