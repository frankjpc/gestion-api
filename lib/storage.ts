'use client';

// Usar localStorage con prefijo para evitar colisiones
const STORAGE_PREFIX = 'api_deportivo_';

export async function saveData(storeName: string, data: any[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `${STORAGE_PREFIX}${storeName}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[v0] Saved ${data.length} items to ${storeName}`);
    }
  } catch (error) {
    console.error(`[v0] Error saving data to ${storeName}:`, error);
  }
}

export async function loadData(storeName: string): Promise<any[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `${STORAGE_PREFIX}${storeName}`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`[v0] Loaded ${parsed.length} items from ${storeName}`);
        return parsed;
      }
    }
  } catch (error) {
    console.error(`[v0] Error loading data from ${storeName}:`, error);
  }
  return [];
}

export function clearLocalStorage(storeName?: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (storeName) {
        localStorage.removeItem(`${STORAGE_PREFIX}${storeName}`);
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}students`);
        localStorage.removeItem(`${STORAGE_PREFIX}attendance`);
        localStorage.removeItem(`${STORAGE_PREFIX}grades`);
      }
    }
  } catch (error) {
    console.error('[v0] Error clearing storage:', error);
  }
}
