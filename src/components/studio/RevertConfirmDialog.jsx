import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";

export default function RevertConfirmDialog({ open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-yellow-400" />
            Are you sure you want to revert?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 pt-2">
            This action will replace the current code with the selected previous version.
            <br />
            Your current code will be lost unless it's part of another version history. You can always revert back to a newer version.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 border-slate-600">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Yes, Revert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}