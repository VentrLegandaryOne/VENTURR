import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Initialize Tesseract OCR worker
 */
async function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
}

/**
 * Extract text from an image file using OCR
 * @param file - Image file (JPG, PNG, PDF)
 * @param onProgress - Optional progress callback (0-1)
 * @returns Extracted text
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const worker = await getWorker();
    
    // Convert file to image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Perform OCR
    const result = await worker.recognize(imageUrl, {}, {
      text: true,
      blocks: true,
      hocr: false,
      tsv: false,
    });
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    // Track progress if callback provided
    if (onProgress) {
      onProgress(1);
    }
    
    return result.data.text;
  } catch (error) {
    console.error('[OCR] Failed to extract text:', error);
    throw new Error('Failed to extract text from image. Please try again or upload a text-based quote.');
  }
}

/**
 * Preprocess image for better OCR accuracy
 * @param file - Image file
 * @returns Preprocessed image blob
 */
export async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const value = factor * (avg - 128) + 128;
        const clampedValue = Math.max(0, Math.min(255, value));
        
        data[i] = clampedValue;     // R
        data[i + 1] = clampedValue; // G
        data[i + 2] = clampedValue; // B
      }
      
      // Put processed image back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if file is an image that can be processed with OCR
 */
export function isImageFile(file: File): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
  return imageTypes.includes(file.type.toLowerCase());
}

/**
 * Terminate OCR worker to free up resources
 */
export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
