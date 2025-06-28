import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { auth } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';
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
  Upload,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import DeleteProjectDialog from "../components/settings/DeleteProjectDialog";
import ImportProjectDialog from "../components/projects/ImportProjectDialog";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        
        if (!user) {
          navigate('/');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = { id: user.uid, ...userDoc.data() };
          setCurrentUser(userData);
          await loadProjects(userData);
        } else {
          logger.error("User document not found");
          navigate('/');
        }
      } catch (error) {
        logger.error("Error fetching user and projects:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndProjects();
  }, [navigate]);

  const loadProjects = async (user) => {
    if (!user) return;
    
    try {
      const data = await Project.filter({ created_by: user.email }, "-created_date");
      setProjects(data);
    } catch (error) {
      logger.error("Error loading projects:", error);
      setProjects([]);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !currentUser) return;
    
    if (projectToDelete.created_by !== currentUser.email) {
      logger.error("Unauthorized: Cannot delete project that doesn't belong to user");
      setProjectToDelete(null);
      return;
    }
    
    try {
      await Project.delete(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjects(currentUser);
    } catch (error) {
      logger.error("Error deleting project:", error);
    }
  };

  const handleEditClick = (project) => {
    if (project.created_by !== currentUser?.email) {
      logger.error("Unauthorized: Cannot edit project that doesn't belong to user");
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
      logger.error("Unauthorized: Cannot update project that doesn't belong to user");
      return;
    }

    try {
      await Project.update(projectId, { name: newProjectName });
      setEditingProjectId(null);
      await loadProjects(currentUser);
    } catch (error) {
      logger.error("Error updating project name:", error);
    }
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

  const handleProjectImported = async () => {
    await loadProjects(currentUser);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <h3 className="text-xl font-semibold text-white">טוען פרויקטים...</h3>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">אנא התחבר למערכת</h1>
          <p className="text-slate-400 mb-6">עליך להתחבר כדי לצפות בפרויקטים שלך</p>
          <Button onClick={() => navigate('/')} className="bg-purple-500 hover:bg-purple-600">
            התחבר
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
      
        <ImportProjectDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onProjectCreated={handleProjectImported}
        />
      
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">הפרויקטים שלי</h1>
              <p className="text-slate-400 text-lg">נהל את כל האפליקציות שלך במקום אחד</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-2xl font-semibold"
              >
                <Upload className="w-5 h-5 mr-2" />
                ייבא פרויקט
              </Button>
              <Link to="/app/studio">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold text-lg glow-box">
                  <Plus className="w-5 h-5 mr-2" />
                  פרויקט חדש
                </Button>
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-300 mb-2">אין עדיין פרויקטים</h3>
              <p className="text-slate-400 mb-8">בוא נתחיל לבנות את האפליקציה הראשונה שלך!</p>
              <Link to="/app/studio">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold">
                  <Plus className="w-5 h-5 mr-2" />
                  צור פרויקט ראשון
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

                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(project.created_date)}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link to={`/app/studio?project=${project.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              המשך שיחה
                            </Button>
                          </Link>
                          
                          <Link to={`/app/settings?project=${project.id}`}>
                            <Button
                              variant="outline"
                              className="bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>

                          {project.status === 'ready' && project.preview_url && (
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
