import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile?: File | null;
  onClearFile?: () => void;
  isProcessing?: boolean;
}

export const UploadZone = ({ 
  onFileUpload, 
  uploadedFile, 
  onClearFile, 
  isProcessing 
}: UploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUpload(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    multiple: false,
    disabled: isProcessing
  });

  const handleClear = () => {
    setPreview(null);
    onClearFile?.();
  };

  if (uploadedFile && preview) {
    return (
      <Card className="p-6 bg-card border-border shadow-soft">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <span className="font-medium text-card-foreground">Imagen cargada</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain rounded-lg bg-muted"
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={cn(
        "p-8 border-2 border-dashed cursor-pointer transition-all duration-300",
        isDragActive 
          ? "border-primary bg-primary/5 shadow-large" 
          : "border-border hover:border-primary/50 hover:shadow-medium",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-card-foreground">
            {isDragActive ? "Suelta tu imagen aquí" : "Sube tu anuncio"}
          </h3>
          <p className="text-muted-foreground">
            Arrastra y suelta una imagen o{" "}
            <span className="text-primary font-medium">haz clic para seleccionar</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Formatos soportados: JPG, PNG, GIF, WebP, BMP
          </p>
        </div>
      </div>
    </Card>
  );
};