'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label: string;
  description?: string;
  error?: string;
  value?: File | null;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/*,.pdf',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label,
  description,
  error,
  value,
  className
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isValidType) {
      return 'Invalid file type';
    }

    return null;
  };

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setIsUploading(false);
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      // You could set an error state here or call an error callback
      return;
    }

    await simulateUpload(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <motion.div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer',
            {
              'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20': isDragOver,
              'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500': !isDragOver && !error,
              'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20': error
            }
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            aria-label={label}
          />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Upload className="w-8 h-8 text-primary-500" />
                  </motion.div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Uploading...
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{uploadProgress}%</p>
              </motion.div>
            ) : value ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="relative">
                    <File className="w-8 h-8 text-primary-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {value.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(value.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="mt-2 inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Drop your file here, or{' '}
                  <span className="text-primary-600 font-medium">browse</span>
                </p>
                {description && (
                  <p className="text-xs text-slate-500">{description}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}; 