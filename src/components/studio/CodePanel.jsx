
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Copy, 
  Download, 
  FileText,
  Check,
  ExternalLink,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

export default function CodePanel({ code, project, previewUrl }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
    if (!code) return;
    
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'App'}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInExpoGo = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Generated Code
          </h3>
          <p className="text-slate-400 text-sm">Complete React Native app code</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!code}
            className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCode}
            disabled={!code}
            className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {code && previewUrl && (
        <div className="mb-4">
          <Button
            onClick={openInExpoGo}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
          >
            <Play className="w-4 h-4 mr-2" />
            Open in Expo GO
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Code Display */}
      <Card className="flex-1 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0 h-full">
          {code ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full overflow-auto"
            >
              <pre className="p-6 text-sm text-slate-200 bg-slate-950/50 rounded-lg h-full overflow-auto font-mono">
                <code className="language-javascript">
                  {code}
                </code>
              </pre>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div>
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-300 font-semibold mb-2">No code generated yet</h4>
                <p className="text-slate-400 text-sm">
                  Start a conversation to generate your React Native app code
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Stats */}
      {code && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                React Native
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
                Expo
              </Badge>
            </div>
            <span>{code.split('\n').length} lines</span>
          </div>
          
          {project?.features && project.features.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Features included:</p>
              <div className="flex flex-wrap gap-1">
                {project.features.slice(0, 4).map((feature, i) => (
                  <Badge 
                    key={i}
                    variant="outline" 
                    className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                  >
                    {feature}
                  </Badge>
                ))}
                {project.features.length > 4 && (
                  <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300">
                    +{project.features.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
