import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, User as UserIcon } from "lucide-react";

export default function UserManagement({ projectId }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      // In a real base44 app, you might filter users by project access.
      // For now, we list all users as an example.
      const allUsers = await User.list();
      setUsers(allUsers);
      setIsLoading(false);
    };
    loadUsers();
  }, [projectId]);
  
  const handleInvite = () => {
      alert("User invitation is handled by the base44 platform. Please use the 'Invite User' feature in the main platform interface.");
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <p className="text-slate-400 text-sm">Manage who has access to this project.</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input placeholder="user@example.com" className="bg-slate-800/50" />
          <Button onClick={handleInvite}>
            <Plus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Project Members</h3>
          {isLoading ? <p>Loading users...</p> : users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{user.full_name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <Badge className={`text-xs ${user.role === 'admin' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>
                {user.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}