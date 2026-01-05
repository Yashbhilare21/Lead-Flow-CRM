import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, LeadStatus, LeadPriority } from '@/types/database';

interface UseOptimisticUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate(options?: UseOptimisticUpdateOptions) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const updateLead = useCallback(async (
    leadId: number,
    updates: Partial<Pick<Lead, 'status' | 'priority' | 'assignee'>>,
    currentData: Lead[],
    setData: React.Dispatch<React.SetStateAction<Lead[]>>
  ) => {
    // Store original state for rollback
    const originalData = [...currentData];
    
    // Optimistic update
    setData(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    ));
    
    setLoadingId(leadId);

    try {
      const { error } = await supabase
        .from('Lead')
        .update(updates)
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      options?.onSuccess?.();
    } catch (error: unknown) {
      // Rollback on error
      setData(originalData);
      
      const errorMessage = getFriendlyErrorMessage(error);
      toast.error(errorMessage);
      
      options?.onError?.(error as Error);
    } finally {
      setLoadingId(null);
    }
  }, [options]);

  return { updateLead, loadingId };
}

function getFriendlyErrorMessage(error: unknown): string {
  const errorStr = String((error as Error)?.message || error);
  
  if (errorStr.includes('row-level security') || errorStr.includes('RLS')) {
    return "You don't have access to this lead";
  }
  if (errorStr.includes('JWT') || errorStr.includes('token')) {
    return 'Session expired – please log in again';
  }
  if (errorStr.includes('network') || errorStr.includes('fetch')) {
    return 'Network error – please check your connection';
  }
  if (errorStr.includes('violates')) {
    return 'Invalid data – please check your input';
  }
  
  return 'Something went wrong. Please try again.';
}
