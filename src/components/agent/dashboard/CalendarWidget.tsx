'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Plus
} from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  client: {
    name: string;
    phone: string;
    email: string;
  };
  propertyId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface CalendarWidgetProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
  onUpdateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
}

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{appointment.title}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {appointment.date}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {appointment.time}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {appointment.location}
              </div>
            </div>
          </div>
          <Badge className={statusColors[appointment.status]}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{appointment.client.name}</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {appointment.client.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {appointment.client.email}
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call Client
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  appointments,
  onAddAppointment,
  onUpdateAppointment
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const todayAppointments = appointments.filter(app => app.date === todayStr);
  const upcomingAppointments = appointments.filter(app => app.date > todayStr);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <Button onClick={onAddAppointment}>
          <Plus className="w-4 h-4 mr-2" />
          Add Viewing
        </Button>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Today&apos;s Viewings
            <Badge variant="secondary">
              {todayAppointments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No viewings scheduled for today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Upcoming Viewings
            <Badge variant="secondary">
              {upcomingAppointments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No upcoming viewings scheduled
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};