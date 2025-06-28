import React, { useState, useEffect } from "react";
import { GitHubConnection } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  GitBranch, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Unlink
} from "lucide-react";
import { motion } from "framer-motion";

export default function GitHubIntegration({ projectId }) {
  const [connection, setConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    github_username: '',
    repository_name: '',
    branch: 'main',
    access_token: ''
  });

  useEffect(() => {
    loadConnection();
  }, [projectId]);

  const loadConnection = async () => {
    try {
      const connections = await GitHubConnection.filter({ project_id: projectId });
      if (connections.length > 0) {
        setConnection(connections[0]);
      }
    } catch (error) {
      console.error("Failed to load GitHub connection:", error);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    if (!formData.github_username || !formData.repository_name || !formData.access_token) {
      return;
    }

    setIsConnecting(true);
    try {
      const newConnection = await GitHubConnection.create({
        project_id: projectId,
        ...formData,
        sync_status: 'connected'
      });
      setConnection(newConnection);
      setFormData({ github_username: '', repository_name: '', branch: 'main', access_token: '' });
    } catch (error) {
      console.error("Failed to connect to GitHub:", error);
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    
    try {
      await GitHubConnection.delete(connection.id);
      setConnection(null);
    } catch (error) {
      console.error("Failed to disconnect from GitHub:", error);
    }
  };

  const handleSync = async () => {
    if (!connection) return;
    
    try {
      await GitHubConnection.update(connection.id, { 
        sync_status: 'syncing',
        last_sync: new Date().toISOString()
      });
      setConnection(prev => ({ ...prev, sync_status: 'syncing' }));
      
      // Here you would implement the actual GitHub API calls
      // For now, we'll simulate success
      setTimeout(async () => {
        await GitHubConnection.update(connection.id, { sync_status: 'connected' });
        setConnection(prev => ({ ...prev, sync_status: 'connected' }));
      }, 2000);
      
    } catch (error) {
      console.error("Failed to sync with GitHub:", error);
      await GitHubConnection.update(connection.id, { sync_status: 'error' });
      setConnection(prev => ({ ...prev, sync_status: 'error' }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'syncing': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span className="font-mono text-sm">{connection.github_username}/{connection.repository_name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <GitBranch className="w-3 h-3" />
                  <span className="text-xs text-slate-400">{connection.branch}</span>
                </div>
              </div>
              <Badge className={getStatusColor(connection.sync_status)}>
                {connection.sync_status === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                {connection.sync_status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                {connection.sync_status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                {connection.sync_status}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                disabled={connection.sync_status === 'syncing'}
                className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                Push to GitHub
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/30"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>

            {connection.last_sync && (
              <p className="text-xs text-slate-400">
                Last sync: {new Date(connection.last_sync).toLocaleString()}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">GitHub Username</Label>
              <Input
                id="username"
                value={formData.github_username}
                onChange={(e) => setFormData(prev => ({ ...prev, github_username: e.target.value }))}
                placeholder="your-username"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="repo" className="text-white">Repository Name</Label>
              <Input
                id="repo"
                value={formData.repository_name}
                onChange={(e) => setFormData(prev => ({ ...prev, repository_name: e.target.value }))}
                placeholder="my-react-native-app"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="branch" className="text-white">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="main"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="token" className="text-white">Access Token</Label>
              <Input
                id="token"
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                placeholder="ghp_xxxxxxxxxxxx"
                className="bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Create a personal access token in GitHub Settings → Developer settings
              </p>
            </div>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !formData.github_username || !formData.repository_name || !formData.access_token}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Connect to GitHub
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}