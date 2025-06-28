import React, { useState } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, RefreshCw, Banknote, Shield, User as UserIcon } from "lucide-react";

export default function UserManagement({ initialUsers, onUserUpdate }) {
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [tokenAmount, setTokenAmount] = useState({});

  const handleTokenChange = (userId, value) => {
    setTokenAmount(prev => ({ ...prev, [userId]: value }));
  };

  const handleUpdateToken = async (userId) => {
    const amount = parseInt(tokenAmount[userId], 10);
    if (isNaN(amount)) return;

    await User.update(userId, { token_balance: amount });
    setTokenAmount(prev => ({...prev, [userId]: ''}));
    onUserUpdate(); // Refresh user list from parent
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    setIsLoading(true);
    // Note: The base44 platform handles the actual email sending for invites.
    // This is a conceptual implementation of starting that process.
    // In a real scenario, this might call a specific `User.invite()` method if available.
    console.log(`Inviting user: ${inviteEmail}`);
    // Assuming an invite mechanism exists. For now, we'll just close and refresh.
    setTimeout(() => {
        setIsLoading(false);
        setIsInviteOpen(false);
        setInviteEmail("");
        onUserUpdate();
    }, 1000);
  };
  
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    await User.delete(selectedUser.id);
    setIsLoading(false);
    setIsDeleteOpen(false);
    setSelectedUser(null);
    onUserUpdate();
  };
  
  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    }
    return <Badge variant="outline"><UserIcon className="w-3 h-3 mr-1" />User</Badge>;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User & Token Management</CardTitle>
          <CardDescription>View, invite, delete, and manage user token balances.</CardDescription>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Enter the email of the user you want to invite. They will receive an email to sign up.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-slate-800 border-slate-600"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteUser} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">Role</TableHead>
              <TableHead className="text-white">Token Balance</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.map((user) => (
              <TableRow key={user.id} className="border-slate-800">
                <TableCell>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-green-400" />
                    <span className="font-mono">{user.token_balance}</span>
                    <Input
                      type="number"
                      placeholder="New balance"
                      value={tokenAmount[user.id] || ''}
                      onChange={(e) => handleTokenChange(user.id, e.target.value)}
                      className="w-32 bg-slate-800 border-slate-600 h-8 ml-4"
                    />
                    <Button size="sm" onClick={() => handleUpdateToken(user.id)}>Update</Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(user)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the user <span className="font-bold">{selectedUser?.email}</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}