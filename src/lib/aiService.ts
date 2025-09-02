import { pipeline, env } from '@huggingface/transformers';
import { generateImage } from './geminiApi'; // Import the mock API

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface AdAnalysis {
  objects: Array<{
    label: string;
    score: number;
    box: { xmin: number; ymin: number; xmax: number; ymax: number };
  }>;
  text: string[];
  colors: string[];
  style: 'modern' | 'classic' | 'minimal' | 'bold';
}

export interface AdFormat {
  width: number;
  height: number;
  ratio: string;
  name: string;
}

export const AD_FORMATS: AdFormat[] = [
  { width: 600, height: 500, ratio: '1.20:1', name: 'Banner Cuadrado' },
  { width: 728, height: 90, ratio: '8.09:1', name: 'Leaderboard' },
  { width: 640, height: 200, ratio: '3.20:1', name: 'Banner Rectangular' }
];

class AIAdService {
  private objectDetector: any = null;
  private textExtractor: any = null;
  private imageClassifier: any = null;

  async initialize() {
    try {
      console.log('Inicializando modelos de IA...');
      
      // Initialize object detection model
      this.objectDetector = await pipeline(
        'object-detection',
        'Xenova/detr-resnet-50',
        { device: 'webgpu' }
      );

      // Initialize image classification for style analysis
      this.imageClassifier = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224',
        { device: 'webgpu' }
      );

      console.log('Modelos de IA inicializados correctamente');
    } catch (error) {
      console.warn('Error inicializando WebGPU, usando CPU:', error);
      
      // Fallback to CPU
      this.objectDetector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
      this.imageClassifier = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');
    }
  }

  async analyzeAd(imageElement: HTMLImageElement): Promise<AdAnalysis> {
    if (!this.objectDetector || !this.imageClassifier) {
      await this.initialize();
    }

    console.log('Analizando anuncio...');

    // Detect objects in the image
    const objects = await this.objectDetector(imageElement);
    console.log('Objetos detectados:', objects);

    // Classify image style
    const styleClassification = await this.imageClassifier(imageElement);
    console.log('Clasificación de estilo:', styleClassification);

    // Extract dominant colors
    const colors = this.extractColors(imageElement);

    // Determine style based on classification
    const style = this.determineStyle(styleClassification);

    // Extract text (simplified - in real implementation would use OCR)
    const text = this.extractTextSimplified(objects);

    return {
      objects: objects.slice(0, 10), // Top 10 objects
      text,
      colors,
      style
    };
  }

  private imageToBase64(image: HTMLImageElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL("image/jpeg");
  }

  private createPrompt(analysis: AdAnalysis, format: AdFormat, imageAsBase64: string): string {
    const detectedObjects = analysis.objects.map(obj => obj.label).join(', ');
    const prompt = `
      Recrea una imagen de anuncio para el formato ${format.name} (${format.width}x${format.height}).
      El anuncio original tiene un estilo ${analysis.style}.
      Debe incluir los siguientes elementos: ${detectedObjects}.
      La paleta de colores principal es: ${analysis.colors.join(', ')}.
      ${analysis.text.length > 0 ? `Incluye el siguiente texto: "${analysis.text.join(' ')}"` : ''}
      Aquí está la imagen original como referencia en base64 (no la copies exactamente, úsala como inspiración):
      ${imageAsBase64.substring(0, 100)}...
    `;
    return prompt.trim();
  }

  async generateAdFormats(
    originalImage: HTMLImageElement,
    analysis: AdAnalysis,
    onProgress?: (format: string, progress: number) => void
  ): Promise<{ [key: string]: Blob }> {
    const results: { [key: string]: Blob } = {};
    const imageAsBase64 = this.imageToBase64(originalImage);

    const generationPromises = AD_FORMATS.map(async (format) => {
      onProgress?.(format.name, 0);
      
      console.log(`Generando formato ${format.name} (${format.width}×${format.height}) con IA...`);
      
      const prompt = this.createPrompt(analysis, format, imageAsBase64);

      const generatedBlob = await generateImage(prompt, {
        width: format.width,
        height: format.height,
      });
      
      results[`format${format.width}x${format.height}`] = generatedBlob;
      onProgress?.(format.name, 100);
    });

    await Promise.all(generationPromises);

    return results;
  }

  private extractColors(image: HTMLImageElement): string[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Sample colors from a smaller version for performance
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(image, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample every 10th pixel
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r}, ${g}, ${b})`;
      
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // Return top 5 colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  private determineStyle(classification: any[]): 'modern' | 'classic' | 'minimal' | 'bold' {
    // Simplified style determination based on classification results
    const topResult = classification[0]?.label.toLowerCase() || '';
    
    if (topResult.includes('minimal') || topResult.includes('simple')) return 'minimal';
    if (topResult.includes('vintage') || topResult.includes('classic')) return 'classic';
    if (topResult.includes('bold') || topResult.includes('bright')) return 'bold';
    
    return 'modern';
  }

  private extractTextSimplified(objects: any[]): string[] {
    // Simplified text extraction - in real implementation would use OCR
    return objects
      .filter(obj => obj.label.includes('text') || obj.label.includes('sign'))
      .map(obj => `Texto detectado: ${obj.label}`)
      .slice(0, 3);
  }
}

export const aiAdService = new AIAdService();