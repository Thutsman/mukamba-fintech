'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationPreferencesProps {
  userId?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId
}) => {
  const {
    isSupported,
    isSubscribed,
    error,
    requestPermission,
    unsubscribe
  } = usePushNotifications(userId);

  const [preferences, setPreferences] = React.useState({
    newProperties: true,
    priceChanges: true,
    favoriteUpdates: true,
    offerResponses: true,
    viewingReminders: true
  });

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermission();
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences) => {
    // If notifications are not enabled, request permission first
    if (!isSubscribed) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Update preferences on the server
    try {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          preferences: {
            ...preferences,
            [key]: !preferences[key]
          }
        })
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      // Revert the change on error
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Push notifications are not supported in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Main Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-blue-500" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-500">
                {isSubscribed
                  ? 'You\'re receiving push notifications'
                  : 'Enable push notifications to stay updated'
                }
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Notification Categories */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y">
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-1">
            Notification Preferences
          </h4>
          <p className="text-sm text-gray-500">
            Choose what you want to be notified about
          </p>
        </div>

        {Object.entries(preferences).map(([key, value]) => (
          <motion.div
            key={key}
            className="p-4 flex items-center justify-between"
            whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
          >
            <div>
              <h5 className="font-medium text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h5>
              <p className="text-sm text-gray-500">
                {getPreferenceDescription(key as keyof typeof preferences)}
              </p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={() => handlePreferenceChange(key as keyof typeof preferences)}
              disabled={!isSubscribed}
            />
          </motion.div>
        ))}
      </div>

      {/* Advanced Settings */}
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => {
          // Navigate to system notification settings
          if ('Notification' in window) {
            window.Notification.requestPermission();
          }
        }}
      >
        <Settings className="w-4 h-4" />
        System Notification Settings
      </Button>
    </div>
  );
};

function getPreferenceDescription(key: keyof typeof NotificationPreferences.prototype.preferences): string {
  switch (key) {
    case 'newProperties':
      return 'Get notified when new properties match your search criteria';
    case 'priceChanges':
      return 'Receive updates when property prices change';
    case 'favoriteUpdates':
      return 'Stay informed about changes to your favorite properties';
    case 'offerResponses':
      return 'Get notified about responses to your offers';
    case 'viewingReminders':
      return 'Receive reminders about scheduled property viewings';
    default:
      return '';
  }
}
