import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, Palette, Tag } from "lucide-react";
import { AdAnalysis } from "@/lib/aiService";

interface AnalysisCardProps {
  analysis: AdAnalysis;
}

export const AnalysisCard = ({ analysis }: AnalysisCardProps) => {
  return (
    <Card className="p-6 bg-card border-border shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Análisis de IA Completado</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Objects Detected */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">Objetos Detectados</span>
          </div>
          <p className="text-2xl font-bold text-primary">{analysis.objects.length}</p>
          <div className="space-y-1">
            {analysis.objects.slice(0, 3).map((obj, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {obj.label}
              </Badge>
            ))}
            {analysis.objects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{analysis.objects.length - 3} más
              </Badge>
            )}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">Estilo</span>
          </div>
          <Badge variant="default" className="capitalize">
            {analysis.style}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Estilo identificado automáticamente
          </p>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">Colores Dominantes</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {analysis.colors.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded border-2 border-border shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {analysis.colors.length} colores extraídos
          </p>
        </div>

        {/* Text Elements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">Texto</span>
          </div>
          <p className="text-2xl font-bold text-primary">{analysis.text.length}</p>
          <p className="text-sm text-muted-foreground">
            Elementos de texto detectados
          </p>
        </div>
      </div>

      {/* Detailed Objects List */}
      {analysis.objects.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground mb-3">Objetos Detectados con Confianza</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.objects.slice(0, 8).map((obj, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{obj.label}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(obj.score * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};