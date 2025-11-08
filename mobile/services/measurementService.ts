/**
 * Mobile Measurement Service
 * Handles on-site measurements, photo capture, and offline data storage
 */

import * as FileSystem from 'expo-file-system';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Measurement {
  id: string;
  projectId: string;
  type: 'distance' | 'area' | 'angle' | 'height';
  value: number;
  unit: string;
  timestamp: Date;
  location?: { latitude: number; longitude: number };
  photo?: string;
  notes?: string;
}

export interface MeasurementProject {
  id: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  measurements: Measurement[];
  photos: string[];
  createdAt: Date;
  syncedAt?: Date;
  synced: boolean;
}

export class MeasurementService {
  private storageKey = 'venturr_measurements';
  private projectsKey = 'venturr_projects';

  /**
   * Create new measurement project
   */
  async createProject(name: string, address: string): Promise<MeasurementProject> {
    const location = await this.getCurrentLocation();
    
    const project: MeasurementProject = {
      id: `proj-${Date.now()}-${Math.random()}`,
      name,
      address,
      location: location || { latitude: 0, longitude: 0 },
      measurements: [],
      photos: [],
      createdAt: new Date(),
      synced: false,
    };

    await this.saveProject(project);
    return project;
  }

  /**
   * Add measurement to project
   */
  async addMeasurement(
    projectId: string,
    measurement: Omit<Measurement, 'id' | 'timestamp'>
  ): Promise<Measurement> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const newMeasurement: Measurement = {
      ...measurement,
      id: `meas-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    project.measurements.push(newMeasurement);
    project.synced = false;
    await this.saveProject(project);

    return newMeasurement;
  }

  /**
   * Capture photo and attach to project
   */
  async capturePhoto(projectId: string): Promise<string> {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera permission denied');
    }

    // In real implementation, would use camera to capture
    // For now, generate placeholder
    const photoUri = `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`;
    
    const project = await this.getProject(projectId);
    if (project) {
      project.photos.push(photoUri);
      project.synced = false;
      await this.saveProject(project);
    }

    return photoUri;
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  }

  /**
   * Calculate area from measurements
   */
  calculateArea(measurements: Measurement[]): number {
    const distances = measurements.filter(m => m.type === 'distance');
    if (distances.length < 2) return 0;

    // Simple calculation: assume rectangular area
    const width = distances[0]?.value || 0;
    const length = distances[1]?.value || 0;
    return width * length;
  }

  /**
   * Calculate roof pitch from measurements
   */
  calculatePitch(measurements: Measurement[]): number {
    const heights = measurements.filter(m => m.type === 'height');
    const distances = measurements.filter(m => m.type === 'distance');

    if (heights.length === 0 || distances.length === 0) return 0;

    const rise = heights[0]?.value || 0;
    const run = distances[0]?.value || 0;
    return (rise / run) * 12; // Pitch in inches per 12 inches
  }

  /**
   * Save project locally
   */
  private async saveProject(project: MeasurementProject): Promise<void> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    await AsyncStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<MeasurementProject | null> {
    const projects = await this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<MeasurementProject[]> {
    try {
      const data = await AsyncStorage.getItem(this.projectsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    await AsyncStorage.setItem(this.projectsKey, JSON.stringify(filtered));
  }

  /**
   * Sync projects to server
   */
  async syncProjects(apiUrl: string, token: string): Promise<void> {
    const projects = await this.getAllProjects();
    const unsyncedProjects = projects.filter(p => !p.synced);

    for (const project of unsyncedProjects) {
      try {
        const response = await fetch(`${apiUrl}/api/trpc/projects.sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            project,
            measurements: project.measurements,
            photos: project.photos,
          }),
        });

        if (response.ok) {
          project.synced = true;
          project.syncedAt = new Date();
          await this.saveProject(project);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }

  /**
   * Export project as PDF
   */
  async exportProjectPDF(projectId: string): Promise<string> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error('Project not found');

    // In real implementation, would generate PDF
    // For now, return placeholder
    const pdfUri = `${FileSystem.documentDirectory}exports/${projectId}.pdf`;
    return pdfUri;
  }

  /**
   * Generate quote from measurements
   */
  async generateQuote(projectId: string, apiUrl: string, token: string): Promise<any> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const area = this.calculateArea(project.measurements);
    const pitch = this.calculatePitch(project.measurements);

    const response = await fetch(`${apiUrl}/api/trpc/quotes.generateFromMeasurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectId,
        area,
        pitch,
        measurements: project.measurements,
        address: project.address,
      }),
    });

    if (!response.ok) throw new Error('Failed to generate quote');
    return response.json();
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    await AsyncStorage.removeItem(this.projectsKey);
    await AsyncStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const measurementService = new MeasurementService();

