import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AdFormatCardProps {
  title: string;
  dimensions: string;
  ratio: string;
  imageUrl?: string;
  isLoading?: boolean;
  onDownload?: () => void;
}

export const AdFormatCard = ({ 
  title, 
  dimensions, 
  ratio, 
  imageUrl, 
  isLoading, 
  onDownload 
}: AdFormatCardProps) => {
  return (
    <Card className="overflow-hidden bg-card border-border shadow-soft hover:shadow-medium transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            disabled={!imageUrl || isLoading}
            className="opacity-70 hover:opacity-100"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full bg-gradient-primary animate-pulse rounded-lg" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} preview`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Vista previa
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium">Tamaño:</span> {dimensions}</p>
          <p><span className="font-medium">Ratio:</span> {ratio}</p>
        </div>
      </div>
    </Card>
  );
};