import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface ImageUploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  width?: number;
  height?: number;
  saveToGallery?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private readonly DEFAULT_QUALITY = 80;
  private readonly DEFAULT_WIDTH = 1024;
  private readonly DEFAULT_HEIGHT = 1024;
  private readonly COMPRESSION_QUALITY = 0.7;

  constructor(private http: HttpClient) {}

  /**
   * Take a photo with the camera
   */
  async takePhoto(options?: CameraOptions): Promise<Photo> {
    try {
      // Check camera permissions
      const permissionStatus = await Camera.checkPermissions();

      if (permissionStatus.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.camera !== 'granted') {
          throw new Error('Permisos de cámara denegados');
        }
      }

      // Take photo
      const photo = await Camera.getPhoto({
        quality: options?.quality || this.DEFAULT_QUALITY,
        allowEditing: options?.allowEditing || false,
        resultType: options?.resultType || CameraResultType.Uri,
        source: CameraSource.Camera,
        width: options?.width || this.DEFAULT_WIDTH,
        height: options?.height || this.DEFAULT_HEIGHT,
        saveToGallery: options?.saveToGallery || false
      });

      return photo;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error('Error al tomar foto: ' + (error as Error).message);
    }
  }

  /**
   * Select a photo from gallery
   */
  async selectFromGallery(options?: CameraOptions): Promise<Photo> {
    try {
      // Check photos permissions
      const permissionStatus = await Camera.checkPermissions();

      if (permissionStatus.photos !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.photos !== 'granted') {
          throw new Error('Permisos de galería denegados');
        }
      }

      // Select photo
      const photo = await Camera.getPhoto({
        quality: options?.quality || this.DEFAULT_QUALITY,
        allowEditing: options?.allowEditing || true,
        resultType: options?.resultType || CameraResultType.Uri,
        source: CameraSource.Photos,
        width: options?.width || this.DEFAULT_WIDTH,
        height: options?.height || this.DEFAULT_HEIGHT
      });

      return photo;
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw new Error('Error al seleccionar foto: ' + (error as Error).message);
    }
  }

  /**
   * Prompt user to choose between camera or gallery
   */
  async choosePhotoSource(options?: CameraOptions): Promise<Photo> {
    try {
      const photo = await Camera.getPhoto({
        quality: options?.quality || this.DEFAULT_QUALITY,
        allowEditing: options?.allowEditing || true,
        resultType: options?.resultType || CameraResultType.Uri,
        source: CameraSource.Prompt,
        width: options?.width || this.DEFAULT_WIDTH,
        height: options?.height || this.DEFAULT_HEIGHT,
        saveToGallery: options?.saveToGallery || false
      });

      return photo;
    } catch (error) {
      console.error('Error choosing photo source:', error);
      throw new Error('Error al seleccionar fuente de foto: ' + (error as Error).message);
    }
  }

  /**
   * Compress image
   */
  async compressImage(photo: Photo, quality?: number): Promise<Blob> {
    try {
      if (!photo.webPath) {
        throw new Error('No se encontró la ruta de la foto');
      }

      // Fetch the photo as a blob
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      // Create image element
      const img = new Image();
      const imageUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'));
            return;
          }

          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const maxDimension = this.DEFAULT_WIDTH;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (compressedBlob) => {
              URL.revokeObjectURL(imageUrl);
              if (compressedBlob) {
                resolve(compressedBlob);
              } else {
                reject(new Error('Error al comprimir imagen'));
              }
            },
            'image/jpeg',
            quality || this.COMPRESSION_QUALITY
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Error al cargar imagen'));
        };

        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Error al comprimir imagen');
    }
  }

  /**
   * Upload photo to server
   */
  async uploadPhoto(photo: Photo, productId?: string): Promise<ImageUploadResult> {
    try {
      // Compress image
      const compressedBlob = await this.compressImage(photo);

      // Create form data
      const formData = new FormData();
      formData.append('file', compressedBlob, `photo_${Date.now()}.jpg`);

      if (productId) {
        formData.append('productId', productId);
      }

      // Upload to server
      const apiUrl = `${environment.apiUrl || 'http://localhost:3000/api'}/products/upload-image`;

      const result = await firstValueFrom(
        this.http.post<ImageUploadResult>(apiUrl, formData)
      );

      return result;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Error al subir foto: ' + (error as Error).message);
    }
  }

  /**
   * Take and upload product photo
   */
  async takeAndUploadProductPhoto(productId?: string): Promise<ImageUploadResult> {
    try {
      // Take photo
      const photo = await this.takePhoto({
        allowEditing: true,
        saveToGallery: false
      });

      // Upload to server
      return await this.uploadPhoto(photo, productId);
    } catch (error) {
      console.error('Error taking and uploading photo:', error);
      throw error;
    }
  }

  /**
   * Select and upload product photo from gallery
   */
  async selectAndUploadProductPhoto(productId?: string): Promise<ImageUploadResult> {
    try {
      // Select photo
      const photo = await this.selectFromGallery({
        allowEditing: true
      });

      // Upload to server
      return await this.uploadPhoto(photo, productId);
    } catch (error) {
      console.error('Error selecting and uploading photo:', error);
      throw error;
    }
  }

  /**
   * Convert data URL to Blob
   */
  async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    try {
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Error converting data URL to blob:', error);
      throw new Error('Error al convertir imagen');
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(_photo: Photo): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!photo.webPath) {
        reject(new Error('No se encontró la ruta de la foto'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        reject(new Error('Error al cargar imagen'));
      };

      img.src = photo.webPath;
    });
  }

  /**
   * Check camera permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissionStatus = await Camera.checkPermissions();
      return permissionStatus.camera === 'granted' && permissionStatus.photos === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissionResult = await Camera.requestPermissions();
      return permissionResult.camera === 'granted' && permissionResult.photos === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Convert Photo to Base64
   */
  async photoToBase64(_photo: Photo): Promise<string> {
    try {
      if (photo.base64String) {
        return photo.base64String;
      }

      if (!photo.webPath) {
        throw new Error('No se encontró la ruta de la foto');
      }

      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix
          const base64String = base64.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting photo to base64:', error);
      throw new Error('Error al convertir foto a base64');
    }
  }

  /**
   * Save photo to gallery
   */
  async saveToGallery(_photo: Photo): Promise<void> {
    try {
      // Note: For this to work, the photo should be taken with saveToGallery: true
      // or manually saved using Capacitor Filesystem
      console.log('Photo save to gallery feature requires additional implementation');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      throw new Error('Error al guardar en galería');
    }
  }
}
