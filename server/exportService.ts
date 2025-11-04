import { PDFDocument, rgb } from 'pdf-lib';
import { createObjectCsvWriter } from 'csv-writer';
import { getDb } from './db';

export async function exportProjectToPDF(projectId: string): Promise<Buffer | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const project = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, projectId),
    });

    if (!project) return null;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();

    let y = height - 50;

    page.drawText('Project Report', {
      x: 50,
      y,
      size: 24,
      color: rgb(0.1, 0.3, 0.8),
    });

    y -= 40;

    const fields = [
      { label: 'Project Title', value: project.title },
      { label: 'Address', value: project.address },
      { label: 'Client', value: project.clientName },
      { label: 'Email', value: project.clientEmail },
      { label: 'Status', value: project.status },
      { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
    ];

    for (const field of fields) {
      page.drawText(`${field.label}:`, {
        x: 50,
        y,
        size: 12,
        color: rgb(0, 0, 0),
      });

      page.drawText(field.value, {
        x: 200,
        y,
        size: 12,
        color: rgb(0.3, 0.3, 0.3),
      });

      y -= 25;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('[Export] Failed to generate PDF:', error);
    return null;
  }
}

export async function exportProjectToCSV(projectId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const project = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, projectId),
    });

    if (!project) return null;

    const records = [
      {
        Field: 'Project Title',
        Value: project.title,
      },
      {
        Field: 'Address',
        Value: project.address,
      },
      {
        Field: 'Client Name',
        Value: project.clientName,
      },
      {
        Field: 'Client Email',
        Value: project.clientEmail,
      },
      {
        Field: 'Status',
        Value: project.status,
      },
      {
        Field: 'Created',
        Value: new Date(project.createdAt).toLocaleDateString(),
      },
    ];

    let csv = 'Field,Value\n';
    for (const record of records) {
      csv += `"${record.Field}","${record.Value}"\n`;
    }

    return csv;
  } catch (error) {
    console.error('[Export] Failed to generate CSV:', error);
    return null;
  }
}

export async function exportCommentsToCSV(resourceId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const comments = await db.query.comments.findMany({
      where: (comments, { eq }) => eq(comments.resourceId, resourceId),
    });

    let csv = 'Author,Date,Comment,Resolved\n';
    for (const comment of comments) {
      const author = comment.authorName || 'Unknown';
      const date = new Date(comment.createdAt).toLocaleDateString();
      const text = comment.content.replace(/"/g, '""');
      const resolved = comment.isResolved ? 'Yes' : 'No';
      csv += `"${author}","${date}","${text}","${resolved}"\n`;
    }

    return csv;
  } catch (error) {
    console.error('[Export] Failed to export comments:', error);
    return null;
  }
}
