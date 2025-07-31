import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceMetricsGrid } from '../PerformanceMetrics';
import { LeadManagement } from '../LeadManagement';
import { PropertyAnalytics } from '../PropertyAnalytics';
import { CommunicationCenter } from '../CommunicationCenter';
import { CalendarWidget } from '../CalendarWidget';
import { mockData } from '../mock-data';

describe('Dashboard Components', () => {
  describe('PerformanceMetricsGrid', () => {
    it('renders all metric cards', () => {
      render(<PerformanceMetricsGrid metrics={mockData.performanceMetrics} />);
      
      // Check for metric titles
      expect(screen.getByText('Response Time')).toBeInTheDocument();
      expect(screen.getByText('Lead to Viewing')).toBeInTheDocument();
      expect(screen.getByText('Monthly Earnings')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText('Active Leads')).toBeInTheDocument();
      expect(screen.getByText('Viewings Scheduled')).toBeInTheDocument();
    });

    it('displays trend indicators correctly', () => {
      render(<PerformanceMetricsGrid metrics={mockData.performanceMetrics} />);
      
      // Check for trend values
      const trendValue = mockData.performanceMetrics.responseTime.percentage;
      expect(screen.getByText(`${trendValue}%`)).toBeInTheDocument();
    });
  });

  describe('LeadManagement', () => {
    const onLeadUpdate = jest.fn();

    it('renders all pipeline stages', () => {
      render(<LeadManagement leads={mockData.leads} onLeadUpdate={onLeadUpdate} />);
      
      // Check for pipeline stages
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Contacted')).toBeInTheDocument();
      expect(screen.getByText('Viewing')).toBeInTheDocument();
      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('handles lead interactions', () => {
      render(<LeadManagement leads={mockData.leads} onLeadUpdate={onLeadUpdate} />);
      
      // Test contact button
      const contactButton = screen.getAllByText('Contact')[0];
      fireEvent.click(contactButton);
      expect(onLeadUpdate).toHaveBeenCalled();
    });
  });

  describe('PropertyAnalytics', () => {
    it('renders all charts', () => {
      render(<PropertyAnalytics data={mockData.propertyAnalytics} />);
      
      // Check for chart titles
      expect(screen.getByText('Property View Trends')).toBeInTheDocument();
      expect(screen.getByText('Most Popular Features')).toBeInTheDocument();
      expect(screen.getByText('Price Comparison')).toBeInTheDocument();
    });
  });

  describe('CommunicationCenter', () => {
    const onSendMessage = jest.fn();
    const onMarkAsRead = jest.fn();

    it('renders messages correctly', () => {
      render(
        <CommunicationCenter
          messages={mockData.messages}
          onSendMessage={onSendMessage}
          onMarkAsRead={onMarkAsRead}
        />
      );
      
      // Check for message content
      mockData.messages.forEach(message => {
        expect(screen.getByText(message.content)).toBeInTheDocument();
      });
    });

    it('handles sending messages', () => {
      render(
        <CommunicationCenter
          messages={mockData.messages}
          onSendMessage={onSendMessage}
          onMarkAsRead={onMarkAsRead}
        />
      );
      
      // Test message sending
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      expect(onSendMessage).toHaveBeenCalledWith('Test message', expect.any(String));
    });
  });

  describe('CalendarWidget', () => {
    const onAddAppointment = jest.fn();
    const onUpdateAppointment = jest.fn();

    it('renders appointments correctly', () => {
      render(
        <CalendarWidget
          appointments={mockData.appointments}
          onAddAppointment={onAddAppointment}
          onUpdateAppointment={onUpdateAppointment}
        />
      );
      
      // Check for appointment details
      mockData.appointments.forEach(appointment => {
        expect(screen.getByText(appointment.title)).toBeInTheDocument();
      });
    });

    it('handles adding new appointments', () => {
      render(
        <CalendarWidget
          appointments={mockData.appointments}
          onAddAppointment={onAddAppointment}
          onUpdateAppointment={onUpdateAppointment}
        />
      );
      
      // Test add appointment button
      const addButton = screen.getByText('Add Viewing');
      fireEvent.click(addButton);
      
      expect(onAddAppointment).toHaveBeenCalled();
    });
  });
});