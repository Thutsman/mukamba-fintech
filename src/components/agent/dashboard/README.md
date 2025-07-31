# Agent Dashboard Components

This directory contains the enhanced components for the Real Estate Agent Dashboard. Each component is designed to be modular, reusable, and follows the project's design system.

## Component Overview

### PerformanceMetricsGrid
- **Purpose**: Displays key performance indicators and metrics for agents
- **Features**:
  - Animated metric counters
  - Trend indicators (up/down)
  - Percentage changes
  - Responsive grid layout
- **Props**:
  ```typescript
  interface PerformanceMetrics {
    responseTime: { current: string; trend: 'up' | 'down'; percentage: number };
    conversionRate: { leadToViewing: number; viewingToApplication: number };
    monthlyEarnings: { amount: number; currency: string; growth: number };
    satisfactionScore: { rating: number; totalReviews: number };
    activeLeads: { count: number; urgent: number };
    viewingsScheduled: { thisWeek: number; nextWeek: number };
  }
  ```

### LeadManagement
- **Purpose**: Manages and tracks leads through the sales pipeline
- **Features**:
  - Kanban-style pipeline visualization
  - Lead status tracking
  - Priority indicators
  - Quick actions for lead interaction
- **Props**:
  ```typescript
  interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'viewing' | 'application' | 'closed';
    isVerified: boolean;
    propertyInterest: string;
    lastContact: string;
    nextFollowUp: string;
    urgency: 'low' | 'medium' | 'high';
  }
  ```

### PropertyAnalytics
- **Purpose**: Visualizes property performance and market data
- **Features**:
  - View trend charts
  - Popular features analysis
  - Price comparison
  - Performance metrics
- **Dependencies**: 
  - Requires `recharts` library
- **Props**:
  ```typescript
  interface PropertyAnalytics {
    viewTrends: Array<{ date: string; views: number; inquiries: number }>;
    popularFeatures: Array<{ feature: string; count: number }>;
    priceAnalysis: Array<{ propertyType: string; yourPrice: number; marketAverage: number }>;
    performanceMetrics: Array<{ metric: string; value: number; change: number }>;
  }
  ```

### CommunicationCenter
- **Purpose**: Centralizes all client communications
- **Features**:
  - Multi-channel messaging
  - Unread indicators
  - Quick replies
  - Channel status monitoring
- **Props**:
  ```typescript
  interface Message {
    id: string;
    sender: { name: string; avatar?: string };
    content: string;
    timestamp: string;
    isUnread: boolean;
    channel: 'email' | 'sms' | 'whatsapp' | 'internal';
  }
  ```

### CalendarWidget
- **Purpose**: Manages property viewings and appointments
- **Features**:
  - Today's viewings
  - Upcoming appointments
  - Quick scheduling
  - Client details
- **Props**:
  ```typescript
  interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    client: { name: string; phone: string; email: string };
    propertyId: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }
  ```

## Usage Example

```tsx
import { PerformanceMetricsGrid } from './dashboard/PerformanceMetrics';
import { LeadManagement } from './dashboard/LeadManagement';
import { PropertyAnalytics } from './dashboard/PropertyAnalytics';
import { CommunicationCenter } from './dashboard/CommunicationCenter';
import { CalendarWidget } from './dashboard/CalendarWidget';

// Inside your component
return (
  <div>
    <PerformanceMetricsGrid metrics={metrics} />
    <LeadManagement leads={leads} onLeadUpdate={handleLeadUpdate} />
    <PropertyAnalytics data={analyticsData} />
    <CommunicationCenter messages={messages} onSendMessage={handleSendMessage} />
    <CalendarWidget appointments={appointments} onAddAppointment={handleAddAppointment} />
  </div>
);
```

## State Management

The dashboard uses a combination of local state and mock data for demonstration. In production:
- Replace mock data with API calls
- Implement real-time updates for messages and leads
- Add proper error handling and loading states
- Connect to authentication system for user verification

## Styling

All components use:
- Tailwind CSS for styling
- Consistent color scheme (primary: red #DC2626)
- Responsive design patterns
- Shadcn UI components as base

## Future Improvements

1. Add real-time notifications
2. Implement data export functionality
3. Add dark mode support
4. Add keyboard shortcuts
5. Implement progressive loading
6. Add error boundaries