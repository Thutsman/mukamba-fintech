'use client';

import { useState, useEffect } from 'react';
import { PropertyListing } from '@/types/property';

interface OfflineFavorite {
  id: string;
  property: PropertyListing;
  addedAt: number;
}

export const useOfflineFavorites = () => {
  const [favorites, setFavorites] = useState<OfflineFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from IndexedDB
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const db = await openDatabase();
        const allFavorites = await getAllFavorites(db);
        setFavorites(allFavorites);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites');
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // IndexedDB setup
  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PropertyApp', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('favorites')) {
          const store = db.createObjectStore('favorites', { keyPath: 'id' });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }
      };
    });
  };

  // Get all favorites from IndexedDB
  const getAllFavorites = (db: IDBDatabase): Promise<OfflineFavorite[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  // Add a property to favorites
  const addFavorite = async (property: PropertyListing) => {
    try {
      const db = await openDatabase();
      const favorite: OfflineFavorite = {
        id: property.id,
        property,
        addedAt: Date.now(),
      };

      const transaction = db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(favorite);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      setFavorites(prev => [...prev, favorite]);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Failed to add favorite');
    }
  };

  // Remove a property from favorites
  const removeFavorite = async (propertyId: string) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(propertyId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite');
    }
  };

  // Check if a property is favorited
  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(fav => fav.id === propertyId);
  };

  // Sync favorites with server
  const syncFavorites = async (userId: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/favorites/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          favorites: favorites.map(fav => ({
            propertyId: fav.id,
            addedAt: fav.addedAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync favorites');
      }

      const { serverFavorites } = await response.json();

      // Update local favorites with server data
      const db = await openDatabase();
      const transaction = db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');

      // Clear existing favorites
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Add server favorites
      for (const favorite of serverFavorites) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(favorite);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      }

      setFavorites(serverFavorites);
    } catch (err) {
      console.error('Error syncing favorites:', err);
      setError('Failed to sync favorites');
    }
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    syncFavorites,
  };
};
