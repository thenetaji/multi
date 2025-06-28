
import React, { useState, useEffect } from "react";
import { User, Project } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderGit2, Banknote, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UserManagement from "../components/admin/UserManagement";
import ProjectViewer from "../components/admin/ProjectViewer";

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const me = await User.me();
        setCurrentUser(me);

        if (me?.role !== 'admin') {
          throw new Error("Access Denied. You must be an administrator to view this page.");
        }

        const [users, projects] = await Promise.all([
          User.list('-created_date', 1000),
          Project.list('-created_date', 1000)
        ]);

        setAllUsers(users);
        setAllProjects(projects);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshUsers = async () => {
    const users = await User.list('-created_date', 1000);
    setAllUsers(users);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">Loading Admin Panel...</p>
          <p className="text-slate-400">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white bg-red-900/20">
        <div className="text-center bg-slate-800 p-8 rounded-lg shadow-lg">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
          <p className="text-slate-300 mt-2">{error}</p>
          <Link to={createPageUrl("Studio")}>
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">SuperAdmin Panel</h1>
          <p className="text-slate-400">Manage all aspects of the Vibe Coding platform.</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-6">
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users &amp; Tokens</TabsTrigger>
            <TabsTrigger value="projects"><FolderGit2 className="w-4 h-4 mr-2" />All Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement initialUsers={allUsers} onUserUpdate={refreshUsers} />
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectViewer projects={allProjects} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
