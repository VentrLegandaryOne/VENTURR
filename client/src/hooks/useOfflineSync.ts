import { useState, useEffect, useCallback } from "react";
import {
  saveDraft,
  getAllDrafts,
  getPendingDrafts,
  updateDraftStatus,
  deleteDraft,
  clearSyncedDrafts,
  getDraftCount,
  type QuoteDraft,
} from "@/lib/offlineStorage";
import { trpc } from "@/lib/trpc";
import { haptics } from "@/lib/haptics";

/**
 * useOfflineSync - Manages offline quote drafts and automatic sync
 * 
 * Features:
 * - Saves incomplete uploads to IndexedDB when offline
 * - Detects online/offline status changes
 * - Automatically syncs pending drafts when connection returns
 * - Provides UI state for offline indicators
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [drafts, setDrafts] = useState<QuoteDraft[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const uploadMutation = trpc.quotes.upload.useMutation();

  // Load drafts on mount
  const loadDrafts = useCallback(async () => {
    try {
      const allDrafts = await getAllDrafts();
      setDrafts(allDrafts);
      
      const pending = await getDraftCount('pending');
      setPendingCount(pending);
    } catch (error) {
      console.error('[OfflineSync] Failed to load drafts:', error);
    }
  }, []);

  // Save quote to offline storage
  const saveOfflineDraft = useCallback(async (
    file: File
  ): Promise<string> => {
    try {
      const id = await saveDraft({
        fileName: file.name,
        fileData: file,
        fileType: file.type,
        fileSize: file.size,
        status: 'pending',
      });

      await loadDrafts();
      haptics.success();
      
      return id;
    } catch (error) {
      console.error('[OfflineSync] Failed to save draft:', error);
      haptics.error();
      throw error;
    }
  }, [loadDrafts]);

  // Sync a single draft
  const syncDraft = useCallback(async (draft: QuoteDraft): Promise<boolean> => {
    try {
      await updateDraftStatus(draft.id, 'syncing');

      // Convert Blob to base64
      const arrayBuffer = await draft.fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Upload to server
      await uploadMutation.mutateAsync({
        fileName: draft.fileName,
        fileType: draft.fileType,
        fileSize: draft.fileSize,
        fileData: base64,
      });

      // Mark as synced
      await updateDraftStatus(draft.id, 'synced');
      await loadDrafts();
      
      return true;
    } catch (error) {
      console.error('[OfflineSync] Failed to sync draft:', error);
      await updateDraftStatus(
        draft.id,
        'error',
        error instanceof Error ? error.message : 'Sync failed'
      );
      await loadDrafts();
      
      return false;
    }
  }, [uploadMutation, loadDrafts]);

  // Sync all pending drafts
  const syncAllDrafts = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    
    try {
      const pending = await getPendingDrafts();
      
      if (pending.length === 0) {
        return;
      }

      console.log(`[OfflineSync] Syncing ${pending.length} drafts...`);

      let successCount = 0;
      for (const draft of pending) {
        const success = await syncDraft(draft);
        if (success) successCount++;
      }

      console.log(`[OfflineSync] Synced ${successCount}/${pending.length} drafts`);
      
      if (successCount > 0) {
        haptics.success();
      }

      // Clean up synced drafts after 24 hours
      await clearSyncedDrafts();
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      haptics.error();
    } finally {
      setIsSyncing(false);
      await loadDrafts();
    }
  }, [isOnline, isSyncing, syncDraft, loadDrafts]);

  // Delete a draft
  const removeDraft = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteDraft(id);
      await loadDrafts();
      haptics.success();
    } catch (error) {
      console.error('[OfflineSync] Failed to delete draft:', error);
      haptics.error();
      throw error;
    }
  }, [loadDrafts]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineSync] Connection restored');
      setIsOnline(true);
      haptics.success();
      
      // Auto-sync after a short delay
      setTimeout(() => {
        syncAllDrafts();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('[OfflineSync] Connection lost');
      setIsOnline(false);
      haptics.warning();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllDrafts]);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    isOnline,
    drafts,
    pendingCount,
    isSyncing,
    saveOfflineDraft,
    syncDraft,
    syncAllDrafts,
    removeDraft,
    loadDrafts,
  };
}
