"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload(content);
        };
        reader.readAsText(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/html": [".html"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <motion.div
          {...getRootProps()}
          className="relative min-h-[200px] rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
          animate={{
            borderColor: isDragActive
              ? "rgb(var(--primary))"
              : "rgb(var(--muted))",
            backgroundColor: isDragActive
              ? "rgba(var(--primary), 0.05)"
              : "transparent",
          }}
          whileHover={{
            borderColor: "rgb(var(--primary))",
            backgroundColor: "rgba(var(--primary), 0.02)",
          }}
          transition={{ duration: 0.2 }}
        >
          <input {...getInputProps()} />

          <AnimatePresence>
            {uploadedFile ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center p-6"
              >
                <motion.div
                  animate={{
                    y: isDragActive ? -10 : 0,
                    scale: isDragActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-4xl mb-4"
                >
                  {isDragActive ? "📂" : "📁"}
                </motion.div>
                <motion.p
                  className="text-base font-medium mb-2"
                  animate={{ scale: isDragActive ? 1.05 : 1 }}
                >
                  {isDragActive ? "Drop it!" : "Drop your bookmarks file here"}
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  or click to select a file
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isDragActive && (
            <motion.div
              className="absolute inset-0 bg-primary/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
