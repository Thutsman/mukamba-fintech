// Test script to check buyer onboarding database functions
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBuyerOnboarding() {
  console.log('Testing buyer onboarding functions...\n');

  try {
    // Test 1: Check if handle_buyer_signup function exists
    console.log('1. Testing handle_buyer_signup function...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'handle_buyer_signup');

    if (functionsError) {
      console.error('Error checking functions:', functionsError);
    } else {
      console.log('Functions found:', functions);
    }

    // Test 2: Check if buyer_onboarding_progress table exists
    console.log('\n2. Testing buyer_onboarding_progress table...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'buyer_onboarding_progress');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Tables found:', tables);
    }

    // Test 3: Check if user_profiles has buyer_type column
    console.log('\n3. Testing user_profiles buyer_type column...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'user_profiles')
      .eq('column_name', 'buyer_type');

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('Columns found:', columns);
    }

    // Test 4: Check current buyer_onboarding_progress records
    console.log('\n4. Checking current buyer_onboarding_progress records...');
    const { data: progress, error: progressError } = await supabase
      .from('buyer_onboarding_progress')
      .select('*')
      .limit(5);

    if (progressError) {
      console.error('Error checking buyer_onboarding_progress:', progressError);
    } else {
      console.log('Current records:', progress);
    }

    // Test 5: Check user_profiles with buyer_type
    console.log('\n5. Checking user_profiles with buyer_type...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, buyer_type, kyc_level, is_phone_verified')
      .not('buyer_type', 'is', null)
      .limit(5);

    if (profilesError) {
      console.error('Error checking user_profiles:', profilesError);
    } else {
      console.log('User profiles with buyer_type:', profiles);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBuyerOnboarding();
