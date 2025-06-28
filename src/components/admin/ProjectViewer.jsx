import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectViewer({ projects }) {

  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      building: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      ready: "bg-green-500/20 text-green-300 border-green-500/30",
      error: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return <Badge className={`${colors[status] || colors.draft} capitalize`}>{status}</Badge>;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle>All System Projects</CardTitle>
        <CardDescription>A complete list of all projects created by all users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-white">Project Name</TableHead>
              <TableHead className="text-white">Created By</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Last Updated</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} className="border-slate-800">
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-slate-400">{project.created_by}</TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>{new Date(project.updated_date).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Link to={createPageUrl(`Studio?project=${project.id}`)}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Project
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}