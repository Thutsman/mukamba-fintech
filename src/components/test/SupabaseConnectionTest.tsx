'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SupabaseConnectionTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Check if Supabase client is initialized
      results.clientInitialized = !!supabase;
      console.log('Supabase client initialized:', !!supabase);

      // Test 2: Check environment variables
      results.envVars = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
      };

      // Test 3: Test basic connection
      if (supabase) {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        results.connectionTest = error ? `❌ ${error.message}` : '✅ Connected';
        results.tableAccess = error ? '❌ Cannot access tables' : '✅ Tables accessible';
      }

      // Test 4: Test authentication
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser();
        results.authTest = error ? `❌ ${error.message}` : '✅ Auth working';
        results.currentUser = user ? `✅ ${user.email}` : '❌ No user logged in';
      }

      // Test 5: Test storage buckets
      if (supabase) {
        try {
          const { data, error } = await supabase.storage.listBuckets();
          results.storageTest = error ? `❌ ${error.message}` : '✅ Storage accessible';
          results.buckets = data?.map(bucket => bucket.name) || [];
        } catch (error) {
          results.storageTest = `❌ ${error}`;
        }
      }

    } catch (error) {
      results.generalError = `❌ ${error}`;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const testUserRegistration = async () => {
    if (!supabase) return;

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    try {
      console.log('Testing user registration with Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            app_type: 'fintech' // Add app metadata to distinguish from early access
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
      } else {
        console.log('Registration successful:', data);
        
        if (data.user) {
          // Try to create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              first_name: 'Test',
              last_name: 'User',
              email: testEmail,
              phone: null,
              user_level: 'new_user',
              user_role: 'user',
              is_phone_verified: false,
              is_identity_verified: false,
              is_financially_verified: false,
              is_address_verified: false,
              is_property_verified: false,
              is_active: true,
              is_suspended: false,
              notification_preferences: { email: true, sms: true, push: true },
              privacy_settings: { profile_visible: true, contact_visible: true }
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            alert(`User created but profile creation failed: ${profileError.message}`);
          } else {
            alert(`✅ Test user created successfully!\n\nEmail: ${testEmail}\nUser ID: ${data.user.id}\n\nCheck your Supabase dashboard to verify!`);
          }
        } else {
          alert(`✅ Registration initiated!\n\nEmail: ${testEmail}\n\nCheck your email for confirmation link.`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Error: ${error}`);
    }
  };

  const checkUserProfiles = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);

      if (error) {
        alert(`Error fetching profiles: ${error.message}`);
      } else {
        alert(`Found ${data?.length || 0} user profiles in database`);
        console.log('User profiles:', data);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 Supabase Connection Test</CardTitle>
          <CardDescription>
            Test your Mukamba FinTech connection to the MukambaGateway Supabase project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runConnectionTest} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Running Tests...' : 'Run Connection Test'}
            </Button>
            <Button 
              onClick={testUserRegistration} 
              variant="outline"
            >
              Test User Registration
            </Button>
            <Button 
              onClick={checkUserProfiles} 
              variant="outline"
            >
              Check User Profiles
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              
              {/* Environment Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <Badge variant={testResults.envVars?.url?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.envVars?.url || 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Anon Key:</span>
                      <Badge variant={testResults.envVars?.key?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.envVars?.key || 'Not tested'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Connection Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Connection Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Client Initialized:</span>
                      <Badge variant={testResults.clientInitialized ? 'default' : 'destructive'}>
                        {testResults.clientInitialized ? '✅ Yes' : '❌ No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Connection:</span>
                      <Badge variant={testResults.connectionTest?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.connectionTest || 'Not tested'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Authentication & Storage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Auth System:</span>
                      <Badge variant={testResults.authTest?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.authTest || 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Current User:</span>
                      <Badge variant={testResults.currentUser?.includes('✅') ? 'default' : 'secondary'}>
                        {testResults.currentUser || 'Not tested'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Storage & Tables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Storage Access:</span>
                      <Badge variant={testResults.storageTest?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.storageTest || 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Table Access:</span>
                      <Badge variant={testResults.tableAccess?.includes('✅') ? 'default' : 'destructive'}>
                        {testResults.tableAccess || 'Not tested'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Storage Buckets */}
              {testResults.buckets && testResults.buckets.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Storage Buckets Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {testResults.buckets.map((bucket: string) => (
                        <Badge key={bucket} variant="outline">
                          {bucket}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {testResults.generalError && (
                <Card className="border-destructive">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-destructive">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">{testResults.generalError}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Create .env.local</strong> file with your Supabase credentials</p>
          <p>2. <strong>Run the database migration</strong> in your Supabase SQL Editor</p>
          <p>3. <strong>Test user registration</strong> to verify the connection</p>
          <p>4. <strong>Check your Supabase dashboard</strong> to see created users and profiles</p>
          <p>5. <strong>Verify storage buckets</strong> are created and accessible</p>
        </CardContent>
      </Card>
    </div>
  );
}
