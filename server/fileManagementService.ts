import { storagePut, storageGet } from './storage';
import { getDb } from './db';

export interface ProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  isLatest: boolean;
  description?: string;
}

export interface FileShare {
  id: string;
  documentId: string;
  sharedWith: string;
  sharedBy: string;
  permission: 'view' | 'download' | 'edit';
  sharedAt: Date;
  expiresAt?: Date;
}

export async function uploadProjectDocument(
  projectId: string,
  fileName: string,
  fileBuffer: Buffer,
  fileType: string,
  userId: string,
  description?: string
): Promise<ProjectDocument | null> {
  try {
    // Upload to S3
    const s3Key = `projects/${projectId}/documents/${Date.now()}-${fileName}`;
    const { key } = await storagePut(s3Key, fileBuffer, fileType);

    // Create document record
    const document: ProjectDocument = {
      id: crypto.randomUUID(),
      projectId,
      fileName,
      fileSize: fileBuffer.length,
      fileType,
      s3Key: key,
      uploadedBy: userId,
      uploadedAt: new Date(),
      version: 1,
      isLatest: true,
      description,
    };

    const db = await getDb();
    if (db) {
      await db.insert(projectDocumentsTable).values(document);
    }

    return document;
  } catch (error) {
    console.error('[FileManagement] Failed to upload:', error);
    return null;
  }
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.projectDocuments.findMany({
      where: (docs, { eq, and }) =>
        and(
          eq(docs.projectId, projectId),
          eq(docs.isLatest, true)
        ),
      orderBy: (docs, { desc }) => [desc(docs.uploadedAt)],
    });
  } catch (error) {
    console.error('[FileManagement] Failed to fetch documents:', error);
    return [];
  }
}

export async function shareDocument(
  documentId: string,
  sharedWith: string,
  sharedBy: string,
  permission: 'view' | 'download' | 'edit' = 'view',
  expiresAt?: Date
): Promise<FileShare | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const share: FileShare = {
      id: crypto.randomUUID(),
      documentId,
      sharedWith,
      sharedBy,
      permission,
      sharedAt: new Date(),
      expiresAt,
    };

    await db.insert(fileSharesTable).values(share);
    return share;
  } catch (error) {
    console.error('[FileManagement] Failed to share:', error);
    return null;
  }
}

export async function getDocumentDownloadUrl(
  documentId: string,
  userId: string
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const document = await db.query.projectDocuments.findFirst({
      where: (docs, { eq }) => eq(docs.id, documentId),
    });

    if (!document) return null;

    // Check permissions
    const share = await db.query.fileShares.findFirst({
      where: (shares, { and, eq }) =>
        and(
          eq(shares.documentId, documentId),
          eq(shares.sharedWith, userId)
        ),
    });

    if (!share && document.uploadedBy !== userId) {
      return null; // No permission
    }

    // Generate presigned URL
    const { url } = await storageGet(document.s3Key, 3600);
    return url;
  } catch (error) {
    console.error('[FileManagement] Failed to get download URL:', error);
    return null;
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(projectDocumentsTable)
      .where(eq(projectDocumentsTable.id, documentId));
    return true;
  } catch (error) {
    console.error('[FileManagement] Failed to delete:', error);
    return false;
  }
}

export async function getDocumentVersions(documentId: string): Promise<ProjectDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.projectDocuments.findMany({
      where: (docs, { eq }) => eq(docs.id, documentId),
      orderBy: (docs, { desc }) => [desc(docs.version)],
    });
  } catch (error) {
    console.error('[FileManagement] Failed to fetch versions:', error);
    return [];
  }
}
