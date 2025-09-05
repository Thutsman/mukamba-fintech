import { supabase, STORAGE_BUCKETS, uploadFile as sbUploadFile, getPublicUrl } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  url: string | null;
  error: string | null;
}

// Mock-safe upload helper with (file, bucket, path) signature and retry logic
export const uploadFile = async (file: File, bucket: string, path: string): Promise<UploadResult> => {
  const maxRetries = 3;
  const timeoutMs = 30000; // 30 seconds timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a fresh file reference for each attempt (avoid cloning issues)
      const fileToUpload = new File([file], file.name, { type: file.type });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), timeoutMs);
      });
      
      // Race between upload and timeout
      await Promise.race([
        sbUploadFile(bucket, path, fileToUpload), // Use fresh file
        timeoutPromise
      ]);

      // Resolve a public URL (mock-safe as well)
      const url = getPublicUrl(bucket, path);
      return { success: true, url, error: null };
    } catch (e: any) {
      console.log(`Upload attempt ${attempt} failed:`, e?.message);
      
      if (attempt === maxRetries) {
        return { success: false, url: null, error: e?.message ?? 'Upload failed after retries' };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return { success: false, url: null, error: 'Upload failed after retries' };
};

// Upload multiple images to property-images folder within the bucket
export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  const baseTimestamp = Date.now();
  
  const uploads = await Promise.all(
    files.map((file, index) => {
      const fileName = `${baseTimestamp}-${index}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
      // Add "property-images/" prefix to upload inside the folder
      const filePath = `property-images/${fileName}`;
      
      return uploadFile(file, STORAGE_BUCKETS.PROPERTY_IMAGES, filePath);
    })
  );
  return uploads;
};


