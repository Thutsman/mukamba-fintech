import { supabase, STORAGE_BUCKETS, uploadFile as sbUploadFile, getPublicUrl } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  url: string | null;
  error: string | null;
}

// Mock-safe upload helper with (file, bucket, path) signature
export const uploadFile = async (file: File, bucket: string, path: string): Promise<UploadResult> => {
  try {
    // Use existing helper which is already mock-safe
    await sbUploadFile(bucket, path, file);

    // Resolve a public URL (mock-safe as well)
    const url = getPublicUrl(bucket, path);
    return { success: true, url, error: null };
  } catch (e: any) {
    return { success: false, url: null, error: e?.message ?? 'Upload failed' };
  }
};

// Upload multiple images to property-images bucket with timestamped names
export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  const uploads = await Promise.all(
    files.map((file) => uploadFile(file, STORAGE_BUCKETS.PROPERTY_IMAGES, `${Date.now()}-${file.name}`))
  );
  return uploads;
};


