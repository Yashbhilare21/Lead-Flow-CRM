import { useEffect, useCallback, useRef } from 'react';

const AUTOSAVE_INTERVAL = 5000; // 5 seconds

interface UseAutosaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
}

export function useAutosave<T>({ key, data, enabled = true }: UseAutosaveOptions<T>) {
  const lastSavedRef = useRef<string>('');

  // Save to localStorage
  const save = useCallback(() => {
    if (!enabled) return;
    
    const serialized = JSON.stringify(data);
    if (serialized !== lastSavedRef.current) {
      localStorage.setItem(`draft_${key}`, serialized);
      lastSavedRef.current = serialized;
    }
  }, [key, data, enabled]);

  // Autosave every 5 seconds
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(save, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [save, enabled]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled) save();
    };
  }, [save, enabled]);

  return { save };
}

export function loadDraft<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(`draft_${key}`);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Invalid JSON, clear it
    localStorage.removeItem(`draft_${key}`);
  }
  return null;
}

export function clearDraft(key: string): void {
  localStorage.removeItem(`draft_${key}`);
}

export function hasDraft(key: string): boolean {
  return localStorage.getItem(`draft_${key}`) !== null;
}
