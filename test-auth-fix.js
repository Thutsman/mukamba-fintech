// Test Authentication Fix
// Run this in your browser console to test the authentication

async function testAuthFix() {
  console.log('🧪 Testing Authentication Fix...');
  
  // Test 1: Check if Supabase client is available
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Supabase client is available');
  } else {
    console.log('❌ Supabase client not found');
    return;
  }
  
  // Test 2: Try to create a test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    console.log('📝 Attempting to create test user:', testEmail);
    
    const { data, error } = await window.supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone: '+27123456789',
          app_type: 'fintech'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Signup successful!');
      console.log('👤 User data:', data.user);
      
      // Test 3: Check if profile was created
      if (data.user) {
        const { data: profile, error: profileError } = await window.supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.log('⚠️ Profile not found yet (might be created by trigger):', profileError.message);
        } else {
          console.log('✅ User profile found:', profile);
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAuthFix();
