import SupabaseConnectionTest from '@/components/test/SupabaseConnectionTest';

export default function TestConnectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 Mukamba FinTech - Supabase Connection Test
          </h1>
          <p className="text-gray-600">
            Test your connection to the MukambaGateway Supabase project
          </p>
        </div>
        
        <SupabaseConnectionTest />
      </div>
    </div>
  );
}
