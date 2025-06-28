import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gem, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function NoTokensDialog({ open, onOpenChange }) {
  const handleUpgradeClick = () => {
    // Navigate to pricing page
    window.location.href = createPageUrl("Pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Gem className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">You're Out of Tokens!</DialogTitle>
          <DialogDescription className="text-center text-slate-400 pt-2">
            To continue creating and editing unlimited apps with our most advanced AI, please upgrade your plan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-3 mt-4">
          <Button 
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade NOW !
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}