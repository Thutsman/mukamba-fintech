'use client';

import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  error: string | null;
}

export const usePushNotifications = (userId?: string) => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    error: null,
  });

  useEffect(() => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications are not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    registerServiceWorker();

    // Check existing subscription
    checkSubscription();
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to register service worker',
      }));
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check notification subscription',
      }));
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Get the server's public key
      const response = await fetch('/api/notifications/public-key');
      const { publicKey } = await response.json();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      // Send the subscription to your server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription,
        }),
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to subscribe to notifications',
      }));
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();

        // Notify your server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            subscription: subscription.toJSON(),
          }),
        });

        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          error: null,
        }));

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to unsubscribe from notifications',
      }));
      return false;
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return await subscribe();
      } else {
        setState(prev => ({
          ...prev,
          error: 'Notification permission denied',
        }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to request notification permission',
      }));
      return false;
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};
