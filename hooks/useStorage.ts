'use client';

import { useEffect, useState } from 'react';
import { loadData, saveData } from '@/lib/storage';

export function useStorage<T>(storeName: string, initialValue: T[] = []) {
  const [data, setData] = useState<T[]>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    const load = async () => {
      try {
        const loadedData = await loadData(storeName);
        setData(loadedData || initialValue);
      } catch (error) {
        console.error(`[v0] Error loading ${storeName}:`, error);
        setData(initialValue);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [storeName, initialValue]);

  const saveToStorage = async (newData: T[]) => {
    setIsSaving(true);
    try {
      await saveData(storeName, newData);
      setData(newData);
      return true;
    } catch (error) {
      console.error(`[v0] Error saving ${storeName}:`, error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = async (updater: (current: T[]) => T[]) => {
    const newData = updater(data);
    return saveToStorage(newData);
  };

  return { data, setData, saveToStorage, updateData, isLoading, isSaving };
}
