import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { ResultsSection } from "@/components/ResultsSection";
import { ProgressModal } from "@/components/ProgressModal";
import { Sparkles, Zap, Brain } from "lucide-react";
import { toast } from "sonner";
import { aiAdService, type AdAnalysis } from "@/lib/aiService";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentFormat, setCurrentFormat] = useState("");
  const [analysis, setAnalysis] = useState<AdAnalysis | null>(null);
  const [results, setResults] = useState<{
    format600x500?: string;
    format728x90?: string;
    format640x200?: string;
  }>({});

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResults({});
    setAnalysis(null);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setResults({});
    setAnalysis(null);
  };

  const generateFormats = async () => {
    if (!uploadedFile) {
      toast.error("Por favor sube una imagen primero");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Inicializando IA...");
    
    try {
      // Initialize AI service
      await aiAdService.initialize();
      setProgress(10);

      // Load image for analysis
      setCurrentStep("Analizando anuncio...");
      const imageElement = await loadImageFromFile(uploadedFile);
      setProgress(20);

      // Analyze the advertisement
      const adAnalysis = await aiAdService.analyzeAd(imageElement);
      setAnalysis(adAnalysis);
      setProgress(40);

      toast.success(`Análisis completado: ${adAnalysis.objects.length} objetos detectados`);

      // Generate formats
      setCurrentStep("Generando formatos...");
      const generatedFormats = await aiAdService.generateAdFormats(
        imageElement,
        adAnalysis,
        (format, formatProgress) => {
          setCurrentFormat(format);
          setCurrentStep(`Generando ${format}...`);
          setProgress(40 + (formatProgress / 100) * 20); // 40-60% for each format
        }
      );

      // Convert blobs to URLs
      const resultUrls: typeof results = {};
      Object.entries(generatedFormats).forEach(([key, blob]) => {
        resultUrls[key as keyof typeof results] = URL.createObjectURL(blob);
      });

      setResults(resultUrls);
      setProgress(100);
      setCurrentStep("¡Completado!");
      
      toast.success("¡Formatos generados exitosamente con IA!");
    } catch (error) {
      console.error("Error generando formatos:", error);
      toast.error("Error al generar los formatos. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setCurrentStep("");
        setProgress(0);
        setCurrentFormat("");
      }, 2000);
    }
  };

  const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadAll = () => {
    Object.entries(results).forEach(([format, url]) => {
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `anuncio-${format.replace('format', '').replace('x', '×')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
    toast.success("Descargando todos los formatos...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-5 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-soft">
            <Brain className="h-4 w-4" />
            Powered by AI Vision & Object Detection
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-hero bg-clip-text text-transparent">
            AdFormat Generator
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Usa modelos avanzados de IA para analizar tu anuncio y recrearlo inteligentemente en múltiples formatos. 
            Detecta objetos, extrae colores y adapta el diseño automáticamente.
          </p>
        </header>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <UploadZone
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onClearFile={handleClearFile}
            isProcessing={isProcessing}
          />
          
          {uploadedFile && (
            <div className="text-center mt-6">
              <Button
                onClick={generateFormats}
                disabled={isProcessing}
                className="bg-gradient-primary hover:shadow-large transition-all duration-300 px-8 py-3 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Generando formatos...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generar Formatos
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Features Info */}
        {!uploadedFile && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">600×500</span>
                </div>
                <h3 className="font-semibold text-foreground">Banner Cuadrado</h3>
                <p className="text-sm text-muted-foreground">Perfecto para redes sociales y displays</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xs">728×90</span>
                </div>
                <h3 className="font-semibold text-foreground">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">Formato estándar para sitios web</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xs">640×200</span>
                </div>
                <h3 className="font-semibold text-foreground">Banner Rectangular</h3>
                <p className="text-sm text-muted-foreground">Ideal para headers y footers</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="max-w-4xl mx-auto mb-8 bg-card border border-border rounded-lg p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análisis de IA Completado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-foreground">Objetos detectados:</span>
                <p className="text-muted-foreground">{analysis.objects.length} elementos</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Estilo identificado:</span>
                <p className="text-muted-foreground capitalize">{analysis.style}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Colores dominantes:</span>
                <div className="flex gap-1 mt-1">
                  {analysis.colors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <ResultsSection
          results={results}
          isLoading={isProcessing}
          onDownloadAll={downloadAll}
        />
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={isProcessing}
        currentStep={currentStep}
        progress={progress}
        format={currentFormat}
      />
    </div>
  );
};

export default Index;