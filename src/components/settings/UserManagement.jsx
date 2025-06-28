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
      // טוען משתמשים שיש להם גישה לפרויקט
      const allUsers = await User.list();
      setUsers(allUsers);
      setIsLoading(false);
    };
    loadUsers();
  }, [projectId]);
  
  const handleInvite = () => {
      alert("הזמנת משתמשים מתבצעת דרך ממשק הניהול הראשי.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול משתמשים</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>טוען...</div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>{user.email}</span>
                  {user.role === 'admin' && (
                    <Badge variant="secondary">מנהל</Badge>
                  )}
                </div>
              </div>
            ))}
            <Button onClick={handleInvite} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              הזמן משתמש חדש
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}