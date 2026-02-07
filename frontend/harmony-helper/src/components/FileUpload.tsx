import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileMusic, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileUpload: (file: File, xmlContent: string) => void;
  uploadedFile: File | null;
  onClear: () => void;
}

const FileUpload = ({ onFileUpload, uploadedFile, onClear }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Accept only MusicXML files
      const validExtensions = [".musicxml", ".xml"];
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!validExtensions.includes(extension)) {
        console.warn("Invalid file type. Please upload a MusicXML file (.musicxml or .xml).");
        return;
      }
      // Read file content as text
      const text = await file.text();
      onFileUpload(file, text);
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5 glow-amber-sm"
                : "border-border hover:border-primary/50 hover:bg-secondary/30"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary"
            >
              <Upload className="h-7 w-7 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Drop your MusicXML file here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Accepts .musicxml and .xml files
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              <FileMusic className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".musicxml,.xml"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between rounded-lg bg-gradient-card border border-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <CheckCircle className="h-5 w-5 text-success-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to practice
                </p>
              </div>
            </div>
            <button
              onClick={onClear}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
