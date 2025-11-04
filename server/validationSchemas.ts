import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3).max(100),
  address: z.string().min(5).max(200),
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email(),
  clientPhone: z.string().regex(/^(\+61|0)[0-9]{9}$/),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  windRegion: z.enum(['A', 'B', 'C', 'D']),
  balRating: z.enum(['LOW', '12.5', '19', '29', '40']),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createMeasurementSchema = z.object({
  projectId: z.string().uuid(),
  address: z.string().min(5).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  roofArea: z.number().min(0).max(10000),
  measurementNotes: z.string().max(1000).optional(),
  drawingData: z.record(z.any()).optional(),
});

export const createTakeoffSchema = z.object({
  projectId: z.string().uuid(),
  roofArea: z.number().min(0).max(10000),
  roofType: z.string().min(2).max(50),
  roofPitch: z.number().min(0).max(90),
  wastePercentage: z.number().min(0).max(100),
  labourRate: z.number().min(0).max(10000),
  profitMargin: z.number().min(0).max(100),
});

export const createQuoteSchema = z.object({
  projectId: z.string().uuid(),
  items: z.array(z.object({
    description: z.string().min(1).max(200),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
  })),
  terms: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
  validUntil: z.date().optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+61|0)[0-9]{9}$/),
  address: z.string().min(5).max(200),
  notes: z.string().max(1000).optional(),
});

export const createCommentSchema = z.object({
  resourceId: z.string().uuid(),
  resourceType: z.enum(['quote', 'project', 'measurement']),
  content: z.string().min(1).max(2000),
});

export const updateSettingsSchema = z.object({
  companyName: z.string().min(2).max(100).optional(),
  companyLogo: z.string().url().optional(),
  businessAddress: z.string().min(5).max(200).optional(),
  phone: z.string().regex(/^(\+61|0)[0-9]{9}$/).optional(),
  email: z.string().email().optional(),
  abn: z.string().regex(/^[0-9]{11}$/).optional(),
  defaultMarkup: z.number().min(0).max(100).optional(),
  defaultLabourRate: z.number().min(0).max(10000).optional(),
});
