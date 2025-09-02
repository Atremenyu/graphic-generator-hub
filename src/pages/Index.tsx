import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { ResultsSection } from "@/components/ResultsSection";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    format600x500?: string;
    format728x90?: string;
    format640x200?: string;
  }>({});

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResults({});
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setResults({});
  };

  const generateFormats = async () => {
    if (!uploadedFile) {
      toast.error("Por favor sube una imagen primero");
      return;
    }

    setIsProcessing(true);
    toast.info("Generando formatos... Esto puede tomar unos momentos");

    try {
      // Simulamos la generación de imágenes - aquí se integraría con la API de Google
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Por ahora creamos URLs de ejemplo
      const mockResults = {
        format600x500: URL.createObjectURL(uploadedFile),
        format728x90: URL.createObjectURL(uploadedFile),
        format640x200: URL.createObjectURL(uploadedFile)
      };
      
      setResults(mockResults);
      toast.success("¡Formatos generados exitosamente!");
    } catch (error) {
      console.error("Error generando formatos:", error);
      toast.error("Error al generar los formatos. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
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
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-hero bg-clip-text text-transparent">
            AdFormat Generator
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Convierte tu anuncio a múltiples formatos publicitarios con tecnología de IA avanzada. 
            Sube tu imagen y obtén versiones optimizadas para diferentes plataformas.
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

        {/* Results Section */}
        <ResultsSection
          results={results}
          isLoading={isProcessing}
          onDownloadAll={downloadAll}
        />
      </div>
    </div>
  );
};

export default Index;