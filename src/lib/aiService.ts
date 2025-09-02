import { pipeline, env } from '@huggingface/transformers';

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

  async generateAdFormats(
    originalImage: HTMLImageElement,
    analysis: AdAnalysis,
    onProgress?: (format: string, progress: number) => void
  ): Promise<{ [key: string]: Blob }> {
    const results: { [key: string]: Blob } = {};

    for (const format of AD_FORMATS) {
      onProgress?.(format.name, 0);
      
      console.log(`Generando formato ${format.name} (${format.width}×${format.height})...`);
      
      const adaptedImage = await this.adaptImageToFormat(
        originalImage,
        format,
        analysis
      );
      
      results[`format${format.width}x${format.height}`] = adaptedImage;
      onProgress?.(format.name, 100);
    }

    return results;
  }

  private async adaptImageToFormat(
    originalImage: HTMLImageElement,
    format: AdFormat,
    analysis: AdAnalysis
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = format.width;
    canvas.height = format.height;

    // Fill background with dominant color
    const bgColor = analysis.colors[0] || '#ffffff';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate optimal image placement and scaling
    const { scale, x, y, width, height } = this.calculateImagePlacement(
      originalImage,
      format,
      analysis
    );

    // Draw adapted image
    ctx.save();
    
    // Apply smart cropping and scaling
    if (format.ratio === '8.09:1') {
      // For leaderboard (very wide), focus on horizontal elements
      this.drawLeaderboardStyle(ctx, originalImage, analysis, format);
    } else if (format.ratio === '1.20:1') {
      // For square-ish format, center main elements
      this.drawSquareStyle(ctx, originalImage, analysis, format);
    } else {
      // For rectangular format, balance elements
      this.drawRectangularStyle(ctx, originalImage, analysis, format);
    }
    
    ctx.restore();

    // Add text overlay if needed (simplified)
    this.addTextOverlay(ctx, analysis, format);

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0);
    });
  }

  private drawLeaderboardStyle(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    analysis: AdAnalysis,
    format: AdFormat
  ) {
    // For leaderboard, create a horizontal composition
    const aspectRatio = image.width / image.height;
    
    if (aspectRatio > 4) {
      // Image is already wide, fit it
      const scale = Math.min(format.width / image.width, format.height / image.height);
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      const x = (format.width - scaledWidth) / 2;
      const y = (format.height - scaledHeight) / 2;
      
      ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    } else {
      // Image is tall, crop and center horizontally
      const cropHeight = image.width / (format.width / format.height);
      const cropY = Math.max(0, (image.height - cropHeight) / 2);
      
      ctx.drawImage(
        image,
        0, cropY, image.width, cropHeight,
        0, 0, format.width, format.height
      );
    }
  }

  private drawSquareStyle(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    analysis: AdAnalysis,
    format: AdFormat
  ) {
    // For square format, center the main content
    const scale = Math.min(format.width / image.width, format.height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (format.width - scaledWidth) / 2;
    const y = (format.height - scaledHeight) / 2;
    
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }

  private drawRectangularStyle(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    analysis: AdAnalysis,
    format: AdFormat
  ) {
    // For rectangular format, smart crop based on content
    const targetRatio = format.width / format.height;
    const imageRatio = image.width / image.height;
    
    if (imageRatio > targetRatio) {
      // Image is wider, crop sides
      const cropWidth = image.height * targetRatio;
      const cropX = (image.width - cropWidth) / 2;
      
      ctx.drawImage(
        image,
        cropX, 0, cropWidth, image.height,
        0, 0, format.width, format.height
      );
    } else {
      // Image is taller, crop top/bottom
      const cropHeight = image.width / targetRatio;
      const cropY = Math.max(0, (image.height - cropHeight) / 2);
      
      ctx.drawImage(
        image,
        0, cropY, image.width, cropHeight,
        0, 0, format.width, format.height
      );
    }
  }

  private calculateImagePlacement(
    image: HTMLImageElement,
    format: AdFormat,
    analysis: AdAnalysis
  ) {
    // Smart placement based on detected objects
    const targetRatio = format.width / format.height;
    const imageRatio = image.width / image.height;
    
    let scale, x, y, width, height;
    
    if (imageRatio > targetRatio) {
      // Image is wider than target
      scale = format.height / image.height;
      height = format.height;
      width = image.width * scale;
      x = (format.width - width) / 2;
      y = 0;
    } else {
      // Image is taller than target
      scale = format.width / image.width;
      width = format.width;
      height = image.height * scale;
      x = 0;
      y = (format.height - height) / 2;
    }
    
    return { scale, x, y, width, height };
  }

  private addTextOverlay(
    ctx: CanvasRenderingContext2D,
    analysis: AdAnalysis,
    format: AdFormat
  ) {
    // Add detected text if needed (simplified implementation)
    if (analysis.text.length > 0 && format.height > 100) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = `${Math.min(format.height / 10, 24)}px Arial`;
      ctx.textAlign = 'center';
      
      const text = analysis.text[0];
      const textWidth = ctx.measureText(text).width;
      
      if (textWidth < format.width * 0.8) {
        ctx.fillText(text, format.width / 2, format.height - 20);
      }
    }
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