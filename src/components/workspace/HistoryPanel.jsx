import React, { useState, useEffect } from "react";
import { ProjectHistory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, Clock, RefreshCw, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPanel({ selectedFile, onRevert }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [selectedFile]);

  const loadHistory = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const historyRecords = await ProjectHistory.filter(
        { 
          project_id: selectedFile.project_id,
          file_path: selectedFile.file_path
        },
        '-created_date',
        50
      );
      setHistory(historyRecords);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
    setIsLoading(false);
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/50 border border-slate-800/50 rounded-2xl">
        <GitCommit className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="font-semibold text-white">Select a file</h3>
        <p>Choose a file from the explorer to view its version history.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-slate-900/50 border border-slate-800/50 rounded-2xl">
      <CardHeader className="border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <GitCommit className="w-5 h-5 text-purple-400" />
          Version History
        </CardTitle>
        <p className="text-sm text-slate-400">History for <span className="font-mono text-purple-300">{selectedFile.file_path}</span></p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400">No history found for this file.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-3 transition-all hover:border-purple-500/50">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 text-sm text-slate-300 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="font-medium text-slate-200 truncate pr-2" title={item.change_description || "AI Generation"}>
                    {item.change_description || "AI Generation"}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRevert(item.content)}
                  className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Revert
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                 <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-slate-700 text-slate-300">
                    by {item.created_by.split('@')[0]}
                  </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </div>
  );
}