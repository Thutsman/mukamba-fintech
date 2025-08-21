# Enhanced Navigation Tabs Component

A sophisticated, animated navigation tabs component with enhanced styling, active states, hover effects, and improved visual hierarchy for badge numbers.

## Features

- ✨ **Sophisticated Styling**: Modern design with gradients, shadows, and smooth transitions
- 🎯 **Active State Differentiation**: Clear visual indicators for active tabs with color-coded themes
- 🎨 **Hover Effects**: Smooth hover animations with scale and lift effects
- 🔢 **Enhanced Badge Numbers**: Improved visual hierarchy with animated badges and glow effects
- 📱 **Responsive Design**: Works seamlessly across all device sizes
- 🎭 **Multiple Variants**: Default, compact, and full size variants
- ⚡ **Framer Motion**: Smooth animations and transitions
- 🎨 **Customizable Colors**: Automatic color assignment or custom color support
- ♿ **Accessibility**: Proper ARIA attributes and keyboard navigation

## Installation

The component is already included in your project. Import it from:

```tsx
import { EnhancedNavigationTabs, createAdminTabs } from '@/components/ui/EnhancedNavigationTabs';
```

## Basic Usage

```tsx
import { EnhancedNavigationTabs, createAdminTabs } from '@/components/ui/EnhancedNavigationTabs';

const MyComponent = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const tabs = createAdminTabs({ 
    listings: 12, 
    kyc: 8, 
    escrow: 3 
  });

  return (
    <EnhancedNavigationTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      variant="default"
    />
  );
};
```

## Props

### EnhancedNavigationTabsProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `NavigationTab[]` | - | Array of tab configurations |
| `activeTab` | `string` | - | Currently active tab ID |
| `onTabChange` | `(tabId: string) => void` | - | Callback when tab changes |
| `variant` | `'default' \| 'compact' \| 'full'` | `'default'` | Size variant of the tabs |
| `className` | `string` | `''` | Additional CSS classes |

### NavigationTab

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | - | Unique identifier for the tab |
| `label` | `string` | - | Display text for the tab |
| `icon` | `LucideIcon` | - | Icon component for the tab |
| `badge` | `number \| null` | `null` | Badge number to display |
| `color` | `string` | - | Custom gradient color (e.g., 'from-blue-500 to-blue-600') |
| `disabled` | `boolean` | `false` | Whether the tab is disabled |

## Variants

### Default
Standard size with balanced spacing and typography.

```tsx
<EnhancedNavigationTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
/>
```

### Compact
Smaller size for space-constrained layouts.

```tsx
<EnhancedNavigationTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="compact"
/>
```

### Full
Larger size for prominent navigation areas.

```tsx
<EnhancedNavigationTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="full"
/>
```

## Predefined Tab Configurations

### Admin Dashboard Tabs

```tsx
import { createAdminTabs } from '@/components/ui/EnhancedNavigationTabs';

const tabs = createAdminTabs({ 
  listings: 12, 
  kyc: 8, 
  escrow: 3 
});
```

### User Dashboard Tabs

```tsx
import { createUserTabs } from '@/components/ui/EnhancedNavigationTabs';

const tabs = createUserTabs();
```

### Agent Dashboard Tabs

```tsx
import { createAgentTabs } from '@/components/ui/EnhancedNavigationTabs';

const tabs = createAgentTabs(15); // 15 pending leads
```

## Custom Tab Configuration

```tsx
import { BarChart3, FileText, Shield } from 'lucide-react';

const customTabs = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: BarChart3, 
    badge: null 
  },
  { 
    id: 'listings', 
    label: 'Listings', 
    icon: FileText, 
    badge: 12,
    color: 'from-green-500 to-green-600' // Custom color
  },
  { 
    id: 'kyc', 
    label: 'KYC', 
    icon: Shield, 
    badge: 8,
    disabled: false
  }
];
```

## Styling Features

### Active State
- Color-coded background with matching border
- Gradient icon background
- Glow effect on icon
- Animated bottom indicator
- Enhanced shadow

### Hover Effects
- Scale animation (1.02x)
- Vertical lift (-1px)
- Background color change
- Smooth transitions

### Badge Enhancements
- Gradient backgrounds
- Glow effects
- Scale animations on hover
- Pulsing animations for attention
- Color-coded based on active state

### Animations
- Spring-based transitions
- Staggered badge animations
- Smooth tab switching
- Layout animations for active indicators

## Accessibility

- Proper ARIA attributes (`aria-current`)
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Disabled state support

## Examples

### Complete Admin Dashboard Integration

```tsx
import { EnhancedNavigationTabs, createAdminTabs } from '@/components/ui/EnhancedNavigationTabs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const tabs = createAdminTabs({ 
    listings: 12, 
    kyc: 8, 
    escrow: 3 
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <EnhancedNavigationTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
      />
      
      <main className="p-6">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'listings' && <ListingsContent />}
        {activeTab === 'kyc' && <KYCContent />}
        {/* ... other tab content */}
      </main>
    </div>
  );
};
```

### Custom Styling

```tsx
<EnhancedNavigationTabs
  tabs={customTabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
  className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
/>
```

## Migration from Basic Navigation

### Before (Basic)
```tsx
const BasicNavigation = () => (
  <nav className="flex space-x-2">
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`px-4 py-2 ${activeTab === tab.id ? 'bg-blue-100' : ''}`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
```

### After (Enhanced)
```tsx
const EnhancedNavigation = () => (
  <EnhancedNavigationTabs
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    variant="default"
  />
);
```

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance

- Optimized animations using Framer Motion
- Efficient re-renders with React.memo
- Minimal bundle size impact
- Smooth 60fps animations

## Troubleshooting

### Badge Not Showing
Ensure the badge value is greater than 0:
```tsx
{ id: 'listings', badge: 12 } // ✅ Shows badge
{ id: 'overview', badge: 0 }  // ❌ No badge
{ id: 'settings', badge: null } // ❌ No badge
```

### Custom Colors Not Working
Use the correct gradient format:
```tsx
// ✅ Correct
{ color: 'from-blue-500 to-blue-600' }

// ❌ Incorrect
{ color: 'blue' }
{ color: '#3B82F6' }
```

### Animations Not Smooth
Ensure Framer Motion is properly installed and configured in your project.

## Contributing

When contributing to this component:

1. Maintain the existing animation patterns
2. Test across different variants
3. Ensure accessibility compliance
4. Update documentation for new features
5. Follow the existing color scheme patterns
