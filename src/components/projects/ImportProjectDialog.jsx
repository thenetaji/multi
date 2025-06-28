
import React, { useState, useRef } from "react";
import { Project, AppFile } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileCode,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImportProjectDialog({ open, onOpenChange, onProjectCreated }) {
  const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Processing, 3: Review, 4: Complete
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const resetDialog = () => {
    setImportStep(1);
    setProjectName("");
    setProjectDescription("");
    setUploadedFiles([]);
    setExtractedFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setError("");
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const filePromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          name: file.name,
          url: file_url,
          type: getFileType(file.name),
          size: file.size
        };
      });

      const uploadedFileResults = await Promise.all(filePromises);
      setUploadedFiles(uploadedFileResults);
      setProgress(50);

      // Auto-generate project name from main file or first file
      const mainFile = uploadedFileResults.find(f => f.name === 'App.js' || f.name === 'index.js') || uploadedFileResults[0];
      if (mainFile && !projectName) {
        const nameWithoutExt = mainFile.name.replace(/\.[^/.]+$/, "");
        setProjectName(nameWithoutExt === 'App' ? 'Imported App' : nameWithoutExt);
      }

      setProgress(100);
      setImportStep(2);
      processFiles(uploadedFileResults);
    } catch (error) {
      setError("Failed to upload files: " + error.message);
      setIsProcessing(false);
    }
  };

  const processFiles = async (files) => {
    setIsProcessing(true);
    const processedFiles = [];

    for (const file of files) {
      try {
        if (file.type === 'text' || file.type === 'code') {
          // For text/code files, fetch content directly
          const response = await fetch(file.url);
          const content = await response.text();
          
          processedFiles.push({
            ...file,
            content,
            path: file.name
          });
        } else if (file.type === 'archive') {
          // For ZIP files, try to extract
          try {
            const extractResult = await ExtractDataFromUploadedFile({
              file_url: file.url,
              json_schema: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        path: { type: "string" },
                        content: { type: "string" }
                      }
                    }
                  }
                }
              }
            });

            if (extractResult.status === 'success' && extractResult.output?.files) {
              extractResult.output.files.forEach(extractedFile => {
                processedFiles.push({
                  name: extractedFile.path.split('/').pop(),
                  path: extractedFile.path,
                  content: extractedFile.content,
                  type: getFileType(extractedFile.path),
                  size: extractedFile.content.length
                });
              });
            }
          } catch (extractError) {
            console.warn("Failed to extract archive:", extractError);
            processedFiles.push({
              ...file,
              content: "// Could not extract content from archive",
              path: file.name
            });
          }
        }
      } catch (error) {
        console.error("Failed to process file:", file.name, error);
        processedFiles.push({
          ...file,
          content: "// Error loading file content",
          path: file.name
        });
      }
    }

    setExtractedFiles(processedFiles);
    setIsProcessing(false);
    setImportStep(3);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt'];
    const archiveExtensions = ['zip', 'tar', 'gz'];
    
    if (codeExtensions.includes(ext)) return 'code';
    if (archiveExtensions.includes(ext)) return 'archive';
    return 'text';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'code': return <FileCode className="w-4 h-4" />;
      case 'archive': return <Package className="w-4 h-4" />;
      default: return <FileCode className="w-4 h-4" />;
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Create project - it will automatically be assigned to current user via created_by
      const project = await Project.create({
        name: projectName,
        description: projectDescription || "Imported project",
        status: "ready",
        framework: "expo"
      });

      setProgress(30);

      // Create files associated with this project
      for (let i = 0; i < extractedFiles.length; i++) {
        const file = extractedFiles[i];
        await AppFile.create({
          project_id: project.id,
          file_path: file.path,
          file_type: getFileTypeEnum(file.type),
          content: file.content || '',
          is_main: file.name === 'App.js' || file.name === 'index.js'
        });
        
        setProgress(30 + (i / extractedFiles.length) * 60);
      }

      setProgress(100);
      setImportStep(4);

      // Call parent callback
      setTimeout(() => {
        onProjectCreated?.(project);
        onOpenChange(false);
        resetDialog();
      }, 2000);

    } catch (error) {
      setError("Failed to create project: " + error.message);
      setIsProcessing(false);
    }
  };

  const getFileTypeEnum = (type) => {
    switch (type) {
      case 'code': return 'javascript';
      case 'archive': return 'config';
      default: return 'javascript';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Project
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Import an existing React Native project from files or archive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= importStep 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step < importStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < importStep ? 'bg-purple-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError("")}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Upload */}
          {importStep === 1 && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-purple-500 cursor-pointer transition-colors"
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Choose Files to Import</h3>
                <p className="text-slate-400 mb-4">
                  Select React Native files (.js, .jsx, .json) or a project archive (.zip)
                </p>
                <Button className="bg-purple-500 hover:bg-purple-600">
                  Select Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".js,.jsx,.ts,.tsx,.json,.md,.txt,.zip,.tar,.gz"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: Processing */}
          {importStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Processing Files...</h3>
                <p className="text-slate-400">Analyzing and extracting project structure</p>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Step 3: Review */}
          {importStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName" className="text-white">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Imported App"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="projectDescription" className="text-white">Description (Optional)</Label>
                <Input
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Imported React Native project"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Files to Import ({extractedFiles.length})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {extractedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.path}</p>
                        <p className="text-xs text-slate-400">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {importStep === 4 && (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold">Project Imported Successfully!</h3>
              <p className="text-slate-400">
                Your project "{projectName}" has been created with {extractedFiles.length} files
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          {importStep === 1 && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-800 border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
          )}
          
          {importStep === 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => setImportStep(1)}
                disabled={isProcessing}
                className="bg-slate-800 border-slate-600 text-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={createProject}
                disabled={isProcessing || !projectName.trim()}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
