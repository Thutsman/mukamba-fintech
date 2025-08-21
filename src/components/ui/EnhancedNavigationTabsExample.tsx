'use client';

import * as React from 'react';
import { 
  BarChart3,
  FileText,
  Shield,
  Building,
  DollarSign,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import { EnhancedNavigationTabs, createAdminTabs, createUserTabs, createAgentTabs } from './EnhancedNavigationTabs';

export const EnhancedNavigationTabsExample: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [activeUserTab, setActiveUserTab] = React.useState('overview');
  const [activeAgentTab, setActiveAgentTab] = React.useState('overview');

  // Example with custom tabs
  const customTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
    { id: 'listings', label: 'Listings', icon: FileText, badge: 12 },
    { id: 'kyc', label: 'KYC', icon: Shield, badge: 8 },
    { id: 'properties', label: 'Properties', icon: Building, badge: null },
    { id: 'escrow', label: 'Escrow', icon: DollarSign, badge: 3 },
    { id: 'users', label: 'Users', icon: Users, badge: null },
    { id: 'reports', label: 'Reports', icon: TrendingUp, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced Navigation Tabs Examples</h2>
        
        {/* Default Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Default Variant (Admin Dashboard)</h3>
          <EnhancedNavigationTabs
            tabs={createAdminTabs({ listings: 12, kyc: 8, escrow: 3 })}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Active Tab: {activeTab}</p>
          </div>
        </div>

        {/* Compact Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Compact Variant (User Dashboard)</h3>
          <EnhancedNavigationTabs
            tabs={createUserTabs()}
            activeTab={activeUserTab}
            onTabChange={setActiveUserTab}
            variant="compact"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Active Tab: {activeUserTab}</p>
          </div>
        </div>

        {/* Full Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Full Variant (Agent Dashboard)</h3>
          <EnhancedNavigationTabs
            tabs={createAgentTabs(15)}
            activeTab={activeAgentTab}
            onTabChange={setActiveAgentTab}
            variant="full"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Active Tab: {activeAgentTab}</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Custom Tabs Configuration</h3>
          <EnhancedNavigationTabs
            tabs={customTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Active Tab: {activeTab}</p>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Import the component:</strong></p>
            <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
              {`import { EnhancedNavigationTabs, createAdminTabs } from '@/components/ui/EnhancedNavigationTabs';`}
            </pre>
            
            <p><strong>2. Use predefined tab configurations:</strong></p>
            <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
              {`const tabs = createAdminTabs({ listings: 12, kyc: 8, escrow: 3 });`}
            </pre>
            
            <p><strong>3. Or create custom tabs:</strong></p>
            <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
              {`const customTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'listings', label: 'Listings', icon: FileText, badge: 12 },
  // ... more tabs
];`}
            </pre>
            
            <p><strong>4. Render the component:</strong></p>
            <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
              {`<EnhancedNavigationTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default" // or "compact" or "full"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
