import { AdFormatCard } from "./AdFormatCard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ResultsSectionProps {
  results: {
    format600x500?: string;
    format728x90?: string;
    format640x200?: string;
  };
  isLoading: boolean;
  onDownloadAll?: () => void;
}

export const ResultsSection = ({ results, isLoading, onDownloadAll }: ResultsSectionProps) => {
  const formats = [
    {
      key: "format600x500" as const,
      title: "Banner Cuadrado",
      dimensions: "600×500",
      ratio: "1.20:1"
    },
    {
      key: "format728x90" as const,
      title: "Leaderboard",
      dimensions: "728×90",
      ratio: "8.09:1"
    },
    {
      key: "format640x200" as const,
      title: "Banner Rectangular",
      dimensions: "640×200",
      ratio: "3.20:1"
    }
  ];

  const hasAnyResult = Object.values(results).some(Boolean);

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Formatos Generados
        </h2>
        {hasAnyResult && (
          <Button
            onClick={onDownloadAll}
            className="bg-gradient-accent hover:shadow-medium transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Todo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formats.map((format) => (
          <AdFormatCard
            key={format.key}
            title={format.title}
            dimensions={format.dimensions}
            ratio={format.ratio}
            imageUrl={results[format.key]}
            isLoading={isLoading}
            onDownload={() => {
              if (results[format.key]) {
                downloadImage(
                  results[format.key]!,
                  `anuncio-${format.dimensions.replace('×', 'x')}.png`
                );
              }
            }}
          />
        ))}
      </div>

      {!hasAnyResult && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Sube una imagen de tu anuncio para generar los diferentes formatos
          </p>
        </div>
      )}
    </div>
  );
};