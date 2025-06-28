import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, RefreshCw, Banknote, Shield, User as UserIcon } from "lucide-react";
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';

export default function UserManagement({ initialUsers, onUserUpdate }) {
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [tokenAmount, setTokenAmount] = useState({});
  const [error, setError] = useState('');

  const handleTokenChange = (userId, value) => {
    setTokenAmount(prev => ({ ...prev, [userId]: value }));
  };

  const handleUpdateToken = async (userId) => {
    const amount = parseInt(tokenAmount[userId], 10);
    if (isNaN(amount)) return;

    await User.update(userId, { token_balance: amount });
    setTokenAmount(prev => ({...prev, [userId]: ''}));
    onUserUpdate(); // רענון רשימת המשתמשים
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await User.invite(inviteEmail);
      setIsInviteOpen(false);
      setInviteEmail("");
      onUserUpdate(); // רענון רשימת המשתמשים
    } catch (error) {
      logger.error('שגיאה בהזמנת משתמש:', error);
      setError('שגיאה בהזמנת משתמש');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await User.delete(selectedUser.id);
      setIsDeleteOpen(false);
      setSelectedUser(null);
      onUserUpdate(); // רענון רשימת המשתמשים
    } catch (error) {
      logger.error('שגיאה במחיקת משתמש:', error);
      setError('שגיאה במחיקת משתמש');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ניהול משתמשים</CardTitle>
          <CardDescription>נהל משתמשים, טוקנים והרשאות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              הזמן משתמש חדש
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>משתמש</TableHead>
                <TableHead>תפקיד</TableHead>
                <TableHead>טוקנים</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={tokenAmount[user.id] || ''}
                        onChange={(e) => handleTokenChange(user.id, e.target.value)}
                        className="w-20"
                        placeholder={user.token_balance?.toString() || '0'}
                      />
                      <Button size="sm" onClick={() => handleUpdateToken(user.id)}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* דיאלוג הזמנת משתמש */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הזמן משתמש חדש</DialogTitle>
            <DialogDescription>
              שלח הזמנה למשתמש חדש להצטרף למערכת
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="אימייל"
              dir="ltr"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleInvite}>
              שלח הזמנה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* דיאלוג מחיקת משתמש */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחק משתמש</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את המשתמש {selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              מחק משתמש
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}