import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image as ImageIcon, Camera, X, CheckCircle2, AlertCircle, Plus, Scale } from "lucide-react";
import { TriangularUpload } from "@/components/branding/TriangularIcons";
import { useLocation } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { extractTextFromImage, isImageFile } from "@/lib/ocr";
import TermsAcceptance, { CURRENT_TERMS_VERSION } from "@/components/TermsAcceptance";
import { UploadProgressIndicator } from "@/components/UploadProgressIndicator";
import { BatchUploadQueue, type UploadQueueItem } from "@/components/BatchUploadQueue";
import { saveUploadProgress, clearUploadProgress } from "@/lib/uploadProgress";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface SelectedFile {
  file: File;
  id: string;
  extractedText?: string;
  isProcessingOCR?: boolean;
  ocrProgress?: number;
}

const MAX_FILES = 20; // Increased for bulk upload support
const MIN_FILES_FOR_COMPARISON = 2;
const TERMS_ACCEPTED_KEY = "venturr_terms_accepted";

export default function QuoteUpload() {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [showTerms, setShowTerms] = useState(() => {
    const acceptedVersion = localStorage.getItem(TERMS_ACCEPTED_KEY);
    // Show terms if never accepted OR if version has changed
    return !acceptedVersion || acceptedVersion !== CURRENT_TERMS_VERSION;
  });
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<"upload" | "analysis" | "results">("upload");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | undefined>(undefined);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch templates
  const { data: templates, error: errorTemplates } = trpc.templates.list.useQuery();
  const { data: categories, error: errorCategories } = trpc.templates.getCategories.useQuery();
  const templateUseMutation = trpc.templates.use.useMutation();

  // Offline sync for draft uploads
  const { isOnline, pendingCount } = useOfflineSync();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndAddFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndAddFiles = useCallback(async (files: File[]) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic',
      'image/heif',
    ];
    
    const maxSize = 16 * 1024 * 1024; // 16MB
    const remainingSlots = MAX_FILES - selectedFiles.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_FILES} quotes allowed`);
      return;
    }

    const validFiles: SelectedFile[] = [];
    
    for (const file of files.slice(0, remainingSlots)) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Use PDF or image files.`);
        continue;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Maximum 16MB.`);
        continue;
      }
      
      validFiles.push({
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    if (validFiles.length === 0) return;

    setUploadError(null);
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Process OCR for image files
    for (const selectedFile of validFiles) {
      if (isImageFile(selectedFile.file)) {
        setSelectedFiles(prev => 
          prev.map(f => f.id === selectedFile.id 
            ? { ...f, isProcessingOCR: true, ocrProgress: 0 }
            : f
          )
        );
        
        try {
          const text = await extractTextFromImage(selectedFile.file, (progress) => {
            setSelectedFiles(prev => 
              prev.map(f => f.id === selectedFile.id 
                ? { ...f, ocrProgress: progress * 100 }
                : f
              )
            );
          });
          
          setSelectedFiles(prev => 
            prev.map(f => f.id === selectedFile.id 
              ? { ...f, extractedText: text, isProcessingOCR: false }
              : f
            )
          );
        } catch (error) {
          console.error('OCR failed:', error);
          setSelectedFiles(prev => 
            prev.map(f => f.id === selectedFile.id 
              ? { ...f, isProcessingOCR: false }
              : f
            )
          );
        }
      }
    }
  }, [selectedFiles.length]);

  const uploadMutation = trpc.quotes.upload.useMutation();
  const createComparisonMutation = trpc.comparisons.create.useMutation();

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadStep("upload");
    setEstimatedTimeRemaining(55); // Total estimated time

    try {
      const uploadedQuoteIds: number[] = [];
      const totalFiles = selectedFiles.length;

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];
        setUploadProgress(Math.round((i / totalFiles) * 50)); // First 50% is uploading

        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile.file);
        });

        const fileData = base64.split(',')[1];

        const result = await uploadMutation.mutateAsync({
          fileName: selectedFile.file.name,
          fileType: selectedFile.file.type,
          fileSize: selectedFile.file.size,
          fileData,
        });

        uploadedQuoteIds.push(result.id);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 50));
        setEstimatedTimeRemaining(Math.max(0, 55 - (i + 1) * 5));
      }

      // Move to analysis step
      setUploadStep("analysis");
      setEstimatedTimeRemaining(45);
      
      // If multiple quotes, create a comparison
      if (uploadedQuoteIds.length >= MIN_FILES_FOR_COMPARISON) {
        setUploadProgress(60);
        toast.info("Creating comparison analysis...");
        
        const comparison = await createComparisonMutation.mutateAsync({
          name: `Quote Comparison - ${new Date().toLocaleDateString()}`,
          quoteIds: uploadedQuoteIds,
        });

        setUploadStep("results");
        setEstimatedTimeRemaining(5);
        setUploadProgress(100);
        toast.success(`${uploadedQuoteIds.length} quotes uploaded! Analyzing to find best offer...`);
        
        // Navigate to comparison result
        setLocation(`/comparison/${comparison.id}`);
      } else {
        // Single quote - go to processing page
        setUploadStep("results");
        setEstimatedTimeRemaining(0);
        setUploadProgress(100);
        toast.success("Quote uploaded successfully!");
        setLocation(`/processing/${uploadedQuoteIds[0]}`);
      }

      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload quotes. Please try again.');
      toast.error(error.message || 'Failed to upload quotes');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
    setUploadError(null);
  };

  const isAnyProcessing = selectedFiles.some(f => f.isProcessingOCR);
  const canUpload = selectedFiles.length > 0 && !isAnyProcessing && !isUploading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 triangle-pattern">
        <div className="container max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="mb-4">Upload Your Quotes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload <strong>2-20 quotes</strong> and we'll analyze them to find the <strong>best value offer</strong>. 
              Our AI compares pricing, materials, compliance, and warranty terms.
            </p>
          </motion.div>

          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Start with a Template</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use pre-filled templates for common projects to speed up verification
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  {showTemplates ? "Hide" : "Show"} Templates
                </Button>
              </div>

              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {categories && categories.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-3">
                    {templates && templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                          selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          templateUseMutation.mutate({ id: template.id });
                          toast.success(`Template "${template.name}" selected`);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="px-2 py-1 bg-muted rounded">{template.category}</span>
                              <span>Est: ${(Number(template.estimatedCost) / 100).toLocaleString()}</span>
                              <span>Used {template.usageCount} times</span>
                            </div>
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 md:p-12">
              {/* File count indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {selectedFiles.length} of {MAX_FILES} quotes selected
                  </span>
                </div>
                {selectedFiles.length >= MIN_FILES_FOR_COMPARISON && (
                  <span className="text-sm text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready for comparison
                  </span>
                )}
              </div>

              {/* Progress bar for file count */}
              <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedFiles.length / MAX_FILES) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Selected files list */}
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mb-6"
                  >
                    {selectedFiles.map((selectedFile, index) => (
                      <motion.div
                        key={selectedFile.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {selectedFile.file.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-card-foreground">
                            {selectedFile.file.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            {selectedFile.isProcessingOCR && (
                              <span className="ml-2 text-primary">
                                • Extracting text... {Math.round(selectedFile.ocrProgress || 0)}%
                              </span>
                            )}
                            {selectedFile.extractedText && !selectedFile.isProcessingOCR && (
                              <span className="ml-2 text-success">• Text extracted</span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(selectedFile.id)}
                          disabled={isUploading}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drop zone - always visible if under max files */}
              {selectedFiles.length < MAX_FILES && (
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 min-h-[200px] sm:min-h-[240px] flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    className="mb-4"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedFiles.length === 0 ? (
                        <TriangularUpload className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                      ) : (
                        <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                      )}
                    </div>
                  </motion.div>

                  <h3 className="text-base sm:text-lg mb-2 text-card-foreground">
                    {isDragging 
                      ? 'Drop your files here' 
                      : selectedFiles.length === 0 
                        ? 'Drag and drop your quotes'
                        : 'Add more quotes'}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {selectedFiles.length === 0 
                      ? 'Upload 2-5 quotes to compare and find the best offer'
                      : `You can add ${MAX_FILES - selectedFiles.length} more quote${MAX_FILES - selectedFiles.length !== 1 ? 's' : ''}`}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  
                  {/* Mobile-friendly buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                      variant={selectedFiles.length === 0 ? "default" : "outline"}
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[48px] flex-1 sm:flex-none sm:min-w-[140px]"
                      size="lg"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      {selectedFiles.length === 0 ? 'Choose Files' : 'Add Files'}
                    </Button>
                    
                    {/* Camera capture button - only on mobile */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.capture = 'environment'; // Use rear camera
                        input.multiple = true;
                        input.onchange = (e: any) => {
                          const files = Array.from(e.target.files || []);
                          validateAndAddFiles(files as File[]);
                        };
                        input.click();
                      }}
                      className="min-h-[48px] flex-1 sm:flex-none sm:min-w-[140px] sm:hidden"
                      size="lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                  </div>

                  {/* Supported formats */}
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mt-4">
                    <span>PDF</span>
                    <span>•</span>
                    <span>JPEG/PNG</span>
                    <span>•</span>
                    <span>HEIC</span>
                    <span>•</span>
                    <span>Max 16MB each</span>
                  </div>
                </motion.div>
              )}

              {/* Batch upload queue */}
              {uploadQueue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8"
                >
                  <BatchUploadQueue
                    items={uploadQueue}
                    onRetry={async (itemId) => {
                      const item = uploadQueue.find(q => q.id === itemId);
                      if (!item || !item.file) {
                        toast.error("Cannot retry: file not found");
                        return;
                      }

                      // Update status to uploading
                      setUploadQueue(prev => prev.map(q => 
                        q.id === itemId ? { ...q, status: "uploading" as const, error: undefined } : q
                      ));

                      try {
                        // Convert file to base64
                        const base64 = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = reject;
                          reader.readAsDataURL(item.file!);
                        });

                        const fileData = base64.split(',')[1];

                        const result = await uploadMutation.mutateAsync({
                          fileName: item.file!.name,
                          fileType: item.file!.type,
                          fileSize: item.file!.size,
                          fileData,
                        });

                        // Update status to completed
                        setUploadQueue(prev => prev.map(q => 
                          q.id === itemId ? { ...q, status: "completed" as const, quoteId: result.id } : q
                        ));

                        toast.success(`Retry successful: ${item.file!.name}`);
                      } catch (error: any) {
                        setUploadQueue(prev => prev.map(q => 
                          q.id === itemId ? { ...q, status: "failed" as const } : q
                        ));
                        toast.error(`Retry failed: ${error.message || "Unknown error"}`);
                      }
                    }}
                    onClearCompleted={() => {
                      setUploadQueue(prev => prev.filter(item => item.status !== "completed"));
                    }}
                  />
                </motion.div>
              )}

              {/* Upload progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8"
                >
                  <UploadProgressIndicator
                    currentStep={uploadStep}
                    estimatedTimeRemaining={estimatedTimeRemaining}
                    fileName={selectedFiles.length === 1 ? selectedFiles[0].file.name : `${selectedFiles.length} quotes`}
                  />
                </motion.div>
              )}

              {/* Action buttons */}
              {selectedFiles.length > 0 && !isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  {/* Recommendation message */}
                  {selectedFiles.length === 1 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">Add more quotes for comparison</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload at least 2 quotes to compare and find the best value. You can upload up to 5.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFiles.length >= MIN_FILES_FOR_COMPARISON && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-success">Ready to compare {selectedFiles.length} quotes</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll analyze pricing, materials, compliance, and warranty to find the best offer.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={handleUpload}
                    disabled={!canUpload}
                    className="w-full"
                  >
                    <Scale className="w-5 h-5 mr-2" />
                    {selectedFiles.length >= MIN_FILES_FOR_COMPARISON 
                      ? `Compare ${selectedFiles.length} Quotes & Find Best Offer`
                      : 'Verify Quote'}
                  </Button>
                </motion.div>
              )}

              {/* Error message */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{uploadError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                title: "Compare Multiple Quotes",
                description: "Upload 2-5 quotes and we'll analyze them side-by-side to find the best value",
              },
              {
                title: "AI-Powered Analysis",
                description: "Our AI compares pricing, materials, compliance, and warranty terms automatically",
              },
              {
                title: "Best Offer Recommendation",
                description: "Get a clear recommendation on which quote offers the best overall value",
              },
            ].map((info, index) => (
              <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm">
                <h4 className="mb-2 text-card-foreground">{info.title}</h4>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Terms Acceptance Dialog */}
      {showTerms && (
        <TermsAcceptance
          onAccept={() => {
            localStorage.setItem(TERMS_ACCEPTED_KEY, CURRENT_TERMS_VERSION);
            setShowTerms(false);
            toast.success("Welcome to VENTURR VALIDT!");
          }}
          onDecline={() => {
            setLocation("/");
          }}
        />
      )}
    </div>
  );
}
