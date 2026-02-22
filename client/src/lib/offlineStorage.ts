/**
 * Offline Storage using IndexedDB
 * Stores incomplete quote uploads locally and syncs when online
 */

const DB_NAME = 'venturr-validt-offline';
const DB_VERSION = 1;
const STORE_NAME = 'quote-drafts';

export interface QuoteDraft {
  id: string;
  fileName: string;
  fileData: Blob;
  fileType: string;
  fileSize: number;
  createdAt: number;
  updatedAt: number;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Save quote draft to IndexedDB
 */
export async function saveDraft(draft: Omit<QuoteDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await openDB();
  const id = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const completeDraft: QuoteDraft = {
    ...draft,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(completeDraft);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all quote drafts
 */
export async function getAllDrafts(): Promise<QuoteDraft[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get pending drafts (not synced yet)
 */
export async function getPendingDrafts(): Promise<QuoteDraft[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single draft by ID
 */
export async function getDraft(id: string): Promise<QuoteDraft | undefined> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update draft status
 */
export async function updateDraftStatus(
  id: string,
  status: QuoteDraft['status'],
  errorMessage?: string
): Promise<void> {
  const db = await openDB();
  const draft = await getDraft(id);

  if (!draft) {
    throw new Error(`Draft ${id} not found`);
  }

  const updatedDraft: QuoteDraft = {
    ...draft,
    status,
    errorMessage,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(updatedDraft);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all synced drafts
 */
export async function clearSyncedDrafts(): Promise<void> {
  const drafts = await getAllDrafts();
  const syncedDrafts = drafts.filter(d => d.status === 'synced');

  for (const draft of syncedDrafts) {
    await deleteDraft(draft.id);
  }
}

/**
 * Get draft count by status
 */
export async function getDraftCount(status?: QuoteDraft['status']): Promise<number> {
  const drafts = await getAllDrafts();
  
  if (!status) {
    return drafts.length;
  }

  return drafts.filter(d => d.status === status).length;
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window;
}
