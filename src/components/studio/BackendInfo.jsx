import React from "react";
import { motion } from "framer-motion";
import { Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackendInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4 mb-4"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Terminal className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h4 className="font-bold text-white mb-1">Connect to Live AI</h4>
          <p className="text-slate-300 text-sm mb-3">
            The app is currently in "Local Mode", using built-in templates for generation. To unlock real-time AI development with Claude, please enable Backend Functions in your workspace settings.
          </p>
          <Button 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => alert("To enable, go to Workspace > Settings > Backend Functions and turn it on.")}
          >
            <Zap className="w-4 h-4 mr-2" />
            Learn How to Enable
          </Button>
        </div>
      </div>
    </motion.div>
  );
}