import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Project, AppFile, ProjectHistory } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderTree, Code2, RefreshCw, Save } from "lucide-react";
import HistoryPanel from "../components/workspace/HistoryPanel";

function FileExplorer({ files, onSelectFile, selectedFile }) {
  return (
    <div className="h-full flex flex-col bg-slate-900/50 border border-slate-800/50 rounded-2xl">
      <div className="p-4 border-b border-slate-800/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-purple-400" />
          Project Files
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.map(file => (
          <button
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedFile?.id === file.id
                ? 'bg-purple-500/20 text-purple-200'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {file.file_path}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Workspace() {
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [historyKey, setHistoryKey] = useState(0);

  const location = useLocation();

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      const projectId = new URLSearchParams(location.search).get('project');
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      const projects = await Project.filter({ id: projectId });
      if (projects.length > 0) {
        setProject(projects[0]);
        const projectFiles = await AppFile.filter({ project_id: projectId }, 'file_path');
        setFiles(projectFiles);
        if (projectFiles.length > 0) {
          const mainFile = projectFiles.find(f => f.file_path === 'App.js') || projectFiles[0];
          setSelectedFile(mainFile);
          setCode(mainFile.content);
        }
      }
      setIsLoading(false);
    };
    fetchProjectData();
  }, [location.search]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCode(file.content);
  };
  
  const handleSave = async () => {
    if (!selectedFile) return;
    await AppFile.update(selectedFile.id, { content: code });
  };

  const handleRevert = async (revertedContent) => {
    if (!selectedFile) return;
    try {
      await AppFile.update(selectedFile.id, { content: revertedContent });
      setSelectedFile(prev => ({ ...prev, content: revertedContent }));
      setCode(revertedContent);
      await ProjectHistory.create({
        project_id: selectedFile.project_id,
        file_path: selectedFile.file_path,
        content: revertedContent,
        change_description: `Reverted to a previous version`
      });
      setHistoryKey(prev => prev + 1);
    } catch (error) {
      console.error("Failed to revert:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <p className="mb-4">Project not found.</p>
        <Link to={createPageUrl("Projects")}>
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 text-white p-4 w-full">
      <header className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Studio") + `?project=${project.id}`}>
            <Button variant="outline" className="bg-slate-800/50 border-slate-700/50">
              <ArrowLeft className="w-4 h-4 mr-2"/> Back to Studio
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-slate-400">Full Project Workspace</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
        </Button>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden w-full">
        <div className="w-[20%] h-full">
          <FileExplorer files={files} onSelectFile={handleFileSelect} selectedFile={selectedFile} />
        </div>
        
        <div className="w-[50%] h-full">
          <div className="h-full flex flex-col bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
             <div className="p-4 border-b border-slate-800/50 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                {selectedFile && (
                  <span className="text-sm text-slate-400">- {selectedFile.file_path}</span>
                )}
             </div>
             <div className="flex-1 overflow-hidden">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-slate-950/50 text-slate-200 font-mono text-sm p-4 border-none outline-none resize-none"
                    placeholder="Select a file to edit..."
                    spellCheck={false}
                />
             </div>
          </div>
        </div>

        <div className="w-[30%] h-full">
          <HistoryPanel key={historyKey} selectedFile={selectedFile} onRevert={handleRevert} />
        </div>
      </div>
    </div>
  );
}