
import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities"; // Assuming Project entity is available for update
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Code2,
  Smartphone,
  Download,
  Share,
  Zap,
  Copy,
  FolderOpen,
  Pencil,
  Check,
  X,
  Banknote, // Added for token display
  Infinity, // Added for admin display
  Star // Added for plan display
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProjectHeader({ project, onToggleCode, showCode, onUpdateProject, currentUser }) { // Added currentUser prop
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (project?.name) {
      setEditedName(project.name);
    }
  }, [project?.name]);

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === project.name) {
      setIsEditingName(false);
      return;
    }

    try {
      // Assuming Project.update is an async function that updates the project in the backend
      // and returns the updated project object.
      // This line would typically interact with an API.
      const updatedProject = await Project.update(project.id, { name: editedName }); 
      onUpdateProject({ ...project, name: editedName }); // Update parent state with the new name
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update project name:", error);
      // Optionally, show an error to the user (e.g., using a toast notification)
      setEditedName(project.name); // Revert on failure
      setIsEditingName(false); // Exit editing mode
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      building: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse",
      ready: "bg-green-500/20 text-green-300 border-green-500/30",
      error: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      draft: "Draft",
      building: "Building...",
      ready: "Ready",
      error: "Error"
    };
    return texts[status] || "Unknown";
  };

  const getStatusIcon = (status) => {
    if (status === 'building') {
      return <Zap className="w-3 h-3 mr-1 animate-pulse" />;
    }
    return null;
  };

  // Utility function to copy text to clipboard
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => console.log('Copied to clipboard successfully!'))
        .catch(err => console.error('Failed to copy text: ', err));
    } else {
      // Fallback for browsers that do not support navigator.clipboard
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Make the textarea invisible and out of the viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Copied to clipboard (fallback success)!');
      } catch (err) {
        console.error('Failed to copy text (fallback): ', err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <div className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Projects")}>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div>
            {!isEditingName ? (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {project?.name || "New Project"}
                </h1>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-7 w-7" onClick={() => setIsEditingName(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-slate-800/50 text-white border-purple-500/50 h-9"
                  autoFocus
                />
                <Button size="icon" className="h-9 w-9 bg-green-500/20 hover:bg-green-500/30" onClick={handleSaveName}>
                  <Check className="w-4 h-4 text-green-300" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsEditingName(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              {project?.status && (
                <Badge className={`${getStatusColor(project.status)} border text-xs`}>
                  {getStatusIcon(project.status)}
                  {getStatusText(project.status)}
                </Badge>
              )}

              {/* TOKEN BALANCE & PLAN DISPLAY */}
              {currentUser && (
                <>
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs capitalize">
                      <Star className="w-3 h-3 mr-1.5" />
                      {currentUser.subscription_plan || 'Free'} Plan
                  </Badge>
                  {currentUser.role !== 'admin' && (
                     <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs">
                        <Banknote className="w-3 h-3 mr-1.5" />
                        {currentUser.token_balance} Tokens
                    </Badge>
                  )}
                </>
              )}
              
              <Badge className={`bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs`}>
                Local Mode
              </Badge>

              <span className="text-slate-400 text-sm">
                {project?.framework === 'expo' ? 'Expo' : 'React Native'}
              </span>
              {project?.features && project.features.length > 0 && (
                <span className="text-slate-400 text-sm">
                  • {project.features.length} features
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New workspace and copy buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(project?.code || "")}
              className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>

            <Link to={createPageUrl("Workspace") + `?project=${project?.id}`}>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Workspace
              </Button>
            </Link>
          </div>

          <Button
            variant="outline"
            onClick={onToggleCode}
            className={`${
              showCode
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                : 'bg-slate-800/50 border-slate-600/50 text-slate-300'
            } hover:bg-purple-500/30`}
          >
            {showCode ? <Smartphone className="w-4 h-4 mr-2" /> : <Code2 className="w-4 h-4 mr-2" />}
            {showCode ? 'Preview' : 'Show Code'}
          </Button>

          {project?.status === 'ready' && (
            <>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
