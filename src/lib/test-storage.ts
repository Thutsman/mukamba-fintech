// Test storage upload functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const testStorageUpload = async () => {
  try {
    console.log('Testing storage upload...');
    
    // Check if buckets exist
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }

    // Check user-documents bucket specifically
    const userDocsBucket = buckets?.find(bucket => bucket.name === 'user-documents');
    console.log('user-documents bucket:', userDocsBucket);

    // Test upload permissions
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const testPath = `test/${Date.now()}/test.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(testPath, testFile);

    if (uploadError) {
      console.error('Upload test failed:', uploadError);
    } else {
      console.log('Upload test successful:', uploadData);
      
      // Clean up test file
      await supabase.storage.from('user-documents').remove([testPath]);
    }

  } catch (error) {
    console.error('Storage test error:', error);
  }
};
