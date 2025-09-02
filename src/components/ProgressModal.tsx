import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Image } from "lucide-react";

interface ProgressModalProps {
  isOpen: boolean;
  currentStep: string;
  progress: number;
  format?: string;
}

export const ProgressModal = ({ isOpen, currentStep, progress, format }: ProgressModalProps) => {
  const getStepIcon = () => {
    if (currentStep.includes('Analizando')) return <Brain className="h-5 w-5 text-primary" />;
    if (currentStep.includes('Generando') || currentStep.includes('Adaptando')) return <Image className="h-5 w-5 text-accent" />;
    return <Zap className="h-5 w-5 text-primary" />;
  };

  const getStepDescription = () => {
    if (currentStep.includes('Analizando')) {
      return 'Identificando objetos, texto y colores en tu anuncio...';
    }
    if (currentStep.includes('Generando')) {
      return `Creando versión optimizada para ${format || 'nuevo formato'}...`;
    }
    if (currentStep.includes('Adaptando')) {
      return 'Ajustando elementos para el nuevo tamaño...';
    }
    return 'Procesando tu anuncio con inteligencia artificial...';
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStepIcon()}
            Procesando con IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="font-medium text-foreground">{currentStep}</p>
            <p className="text-sm text-muted-foreground">{getStepDescription()}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground">Analizando contenido visual</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-muted-foreground">Adaptando diseño inteligentemente</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground">Optimizando para múltiples formatos</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};