
import React, { useState, useEffect } from "react";
import { Project, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Shield, Trash2, Github, RefreshCw } from "lucide-react"; // Added RefreshCw
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UserManagement from "../components/settings/UserManagement";
import DeleteProjectDialog from "../components/settings/DeleteProjectDialog";
import GitHubIntegration from "../components/github/GitHubIntegration";

export default function Settings() {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjectAndUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const params = new URLSearchParams(location.search);
        const projectId = params.get('project');
        
        if (projectId && user) {
          // Filter projects by current user's email
          // Assuming Project.filter can take an object for filtering, including created_by
          const projects = await Project.filter({ 
            id: projectId, 
            created_by: user.email 
          });
          const currentProject = projects[0]; // Assuming filter returns an array, take the first match
          
          if (!currentProject) {
            console.error("Project not found or doesn't belong to user.");
            navigate(createPageUrl("Projects"));
            return;
          }
          
          setProject(currentProject);
        } else if (!user) {
            // If user is not authenticated, redirect to projects or login
            console.error("User not authenticated.");
            navigate(createPageUrl("Projects"));
        } else if (!projectId) {
            // If no project ID is provided, navigate back to projects
            navigate(createPageUrl("Projects"));
        }
      } catch (error) {
        console.error("Failed to load project or user:", error);
        // In case of any error during user/project loading, redirect
        navigate(createPageUrl("Projects"));
      } finally {
        setIsLoading(false);
      }
    };
    loadProjectAndUser();
  }, [location.search, navigate]);

  const handleDeleteProject = async () => {
    if (!project || !currentUser) return;
    
    // Verify project belongs to current user before allowing deletion
    if (project.created_by !== currentUser.email) {
      console.error("Unauthorized: Cannot delete project that doesn't belong to user.");
      return; // Prevent deletion if not authorized
    }
    
    try {
      await Project.delete(project.id);
      navigate(createPageUrl("Projects"));
    } catch (error) {
      console.error("Failed to delete project:", error);
      // Optionally, show an error message to the user
    }
  };

  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center p-8 text-white">
            <div className="flex flex-col items-center gap-4 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                <h3 className="text-xl font-semibold text-white">טוען הגדרות...</h3>
            </div>
        </div>
    );
  }

  // If project is null after loading and not loading, it means it wasn't found or access was denied.
  if (!project || !currentUser) {
    return <div className="p-8 text-white">Project not found or access denied.</div>;
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProject}
      />
      <div className="w-full">
        <div className="mb-8">
          <Link to={createPageUrl("Projects")}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">
            Settings for <span className="text-purple-400">{project.name}</span>
          </h1>
          <p className="text-slate-400">Manage your project settings</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users & Access</TabsTrigger>
            <TabsTrigger value="github"><Github className="w-4 h-4 mr-2" />GitHub</TabsTrigger>
            <TabsTrigger value="general"><Shield className="w-4 h-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="danger"><Trash2 className="w-4 h-4 mr-2" />Danger Zone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement projectId={project.id} />
          </TabsContent>

          <TabsContent value="github" className="mt-6">
            <GitHubIntegration projectId={project.id} />
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-400">General project settings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="danger" className="mt-6">
            <Card className="bg-slate-900/50 border-red-500/30">
              <CardHeader><CardTitle className="text-red-400">Danger Zone</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Delete Project</h3>
                  <p className="text-slate-400 text-sm mb-2">This action is irreversible. Please be certain.</p>
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    Delete This Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
