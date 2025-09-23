import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase project details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  PROPERTY_DOCUMENTS: 'property-documents',
  USER_DOCUMENTS: 'user-documents',
  KYC_DOCUMENTS: 'kyc-documents',
} as const;

// Create client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export createClient function for use in API routes
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

// Export createServiceClient function for use in API routes (bypasses RLS)
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role credentials not configured');
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Helper function to get a mock URL for development
const getMockUrl = (bucket: string, path: string) => {
  // Return placeholder images for development
  if (bucket === STORAGE_BUCKETS.PROPERTY_IMAGES) {
    return `https://picsum.photos/seed/${path}/400/300`;
  }
  // Return mock PDF URL for documents
  return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
};

// Helper function to get a public URL for a file
export const getPublicUrl = (bucket: string, path: string) => {
  if (!supabase) {
    console.log('Using mock storage URL:', { bucket, path });
    return getMockUrl(bucket, path);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to upload a file
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  if (!supabase) {
    console.log('Mock file upload:', { bucket, path, fileName: file.name });
    return {
      path: path,
      fullPath: getMockUrl(bucket, path)
    };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  return data;
};

// Helper function to download a file
export const downloadFile = async (
  bucket: string,
  path: string
) => {
  if (!supabase) {
    console.log('Mock file download:', { bucket, path });
    const response = await fetch(getMockUrl(bucket, path));
    return response.blob();
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw error;
  }

  return data;
};

// Helper function to list files in a folder
export const listFiles = async (
  bucket: string,
  prefix?: string
) => {
  if (!supabase) {
    console.log('Mock file listing:', { bucket, prefix });
    return [
      { name: 'mock-file-1.jpg', size: 1024, created_at: new Date().toISOString() },
      { name: 'mock-file-2.pdf', size: 2048, created_at: new Date().toISOString() }
    ];
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix || '');

  if (error) {
    throw error;
  }

  return data;
};

// Helper function to delete a file
export const deleteFile = async (
  bucket: string,
  paths: string[]
) => {
  if (!supabase) {
    console.log('Mock file deletion:', { bucket, paths });
    return { paths };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    throw error;
  }

  return data;
}; 