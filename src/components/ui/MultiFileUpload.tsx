'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface MultiFileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label: string;
  description?: string;
  error?: string;
  files?: File[];
  multiple?: boolean;
  className?: string;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  onFilesChange,
  accept = 'image/*,.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label,
  description,
  error,
  files = [],
  multiple = true,
  className
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter(file => {
      if (file.size > maxSize) {
        return false;
      }
      return true;
    });

    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver
            ? "border-red-500 bg-red-50 dark:bg-red-950/10"
            : "border-slate-300 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600",
          error && "border-red-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="sr-only"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </div>
          {description && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {description}
            </div>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Click to browse or drag and drop files here
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Max file size: {formatFileSize(maxSize)}
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Uploaded Files ({files.length})
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-slate-500 hover:text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 