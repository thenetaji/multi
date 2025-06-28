
import React, { useState, useEffect } from "react";
import { Project, User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Smartphone,
  Code2,
  Calendar,
  Trash2,
  Play,
  Download,
  Edit,
  Pencil,
  Check,
  X,
  Settings,
  Upload
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DeleteProjectDialog from "../components/settings/DeleteProjectDialog";
import ImportProjectDialog from "../components/projects/ImportProjectDialog";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadProjects(user);
      } catch (error) {
        console.error("User not authenticated or error fetching user:", error);
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    fetchUserAndProjects();
  }, []);

  const loadProjects = async (user = currentUser) => {
    if (!user) {
      setIsLoading(false); // Ensure loading is set to false if no user
      return;
    }
    
    setIsLoading(true);
    try {
      // Filter projects by current user's email
      const data = await Project.filter({ created_by: user.email }, "-created_date");
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
    setIsLoading(false);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !currentUser) return;
    
    // Verify project belongs to current user before deleting
    if (projectToDelete.created_by !== currentUser.email) {
      console.error("Unauthorized: Cannot delete project that doesn't belong to user");
      // Optionally, show a toast/notification to the user
      setProjectToDelete(null); // Close dialog if unauthorized attempt
      return;
    }
    
    await Project.delete(projectToDelete.id);
    setProjectToDelete(null);
    loadProjects();
  };

  const handleEditClick = (project) => {
    // Verify project belongs to current user
    if (project.created_by !== currentUser?.email) {
      console.error("Unauthorized: Cannot edit project that doesn't belong to user");
      // Optionally, show a toast/notification to the user
      return;
    }
    setEditingProjectId(project.id);
    setNewProjectName(project.name);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setNewProjectName("");
  };

  const handleSaveName = async (projectId) => {
    if (!newProjectName.trim() || !currentUser) return;

    const project = projects.find(p => p.id === projectId);
    if (!project || project.created_by !== currentUser.email) {
      console.error("Unauthorized: Cannot update project that doesn't belong to user");
      // Optionally, show a toast/notification to the user
      return;
    }

    await Project.update(projectId, { name: newProjectName });
    setEditingProjectId(null);
    loadProjects();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      building: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      ready: "bg-green-500/20 text-green-300 border-green-500/30",
      error: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      draft: "Draft",
      building: "Building",
      ready: "Ready",
      error: "Error"
    };
    return texts[status] || "Unknown";
  };

  const handleProjectImported = (newProject) => {
    loadProjects(); // Refresh the projects list
  };

  // Show login prompt if not authenticated and not currently loading user info
  if (!currentUser && !isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-slate-400 mb-6">You need to be logged in to view your projects</p>
          <Button onClick={() => User.login()} className="bg-purple-500 hover:bg-purple-600">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="w-full">
        <DeleteProjectDialog
          open={!!projectToDelete}
          onOpenChange={() => setProjectToDelete(null)}
          onConfirm={confirmDeleteProject}
        />
      
        {/* Import Project Dialog */}
        <ImportProjectDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onProjectCreated={handleProjectImported}
        />
      
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">My Projects</h1>
              <p className="text-slate-400 text-lg">Manage all your apps in one place</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-2xl font-semibold"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import Project
              </Button>
              <Link to={createPageUrl("Studio")}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold text-lg glow-box">
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-700 rounded"></div>
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-300 mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-8">Let's start building your first app!</p>
              <Link to={createPageUrl("Studio")}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300 group chat-bubble">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {editingProjectId === project.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName(project.id)}
                                className="bg-slate-800/50 text-white h-9"
                                autoFocus
                              />
                               <Button size="icon" className="h-8 w-8 bg-green-500/20 hover:bg-green-500/30 flex-shrink-0" onClick={() => handleSaveName(project.id)}>
                                <Check className="w-4 h-4 text-green-300" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={handleCancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                               <CardTitle className="text-xl font-bold text-white mb-1 group-hover:gradient-text transition-all duration-300">
                                {project.name}
                              </CardTitle>
                              <Button variant="ghost" size="icon" className="w-6 h-6 text-slate-500 opacity-0 group-hover:opacity-100" onClick={() => handleEditClick(project)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                            {project.description}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(project.status)} border`}>
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.features.slice(0, 3).map((feature, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {project.features.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300">
                                +{project.features.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(project.created_date), "MMM dd, yyyy")}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link to={createPageUrl("Studio", { project: project.id })} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Continue Chat
                            </Button>
                          </Link>
                          
                          <Link to={createPageUrl("Settings", { project: project.id })}>
                            <Button
                              variant="outline"
                              className="bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>

                          {project.status === 'ready' && (
                            <a href={project.preview_url} target="_blank" rel="noopener noreferrer">
                              <Button
                                variant="outline"
                                className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </a>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => setProjectToDelete(project)}
                            className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
