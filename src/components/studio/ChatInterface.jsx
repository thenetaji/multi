import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Code, AlertCircle, RefreshCw, Clock, Brain, Image as ImageIcon, Search, Paintbrush, GitCommit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatInterface({ message, isGenerating, onRevert, currentUser }) {
  const isUser = message.sender === currentUser?.uid && message.message_type === "text";
  const isSystem = message.message_type === "system"; // Check by message_type instead of sender
  const isAssistant = message.message_type === "assistant"; // Check for assistant messages
  const isError = message.message_type === "error";
  const hasCode = message.metadata?.code_generated;
  const hasHistory = message.metadata?.history_id;
  const thinkingTime = message.metadata?.thinking_time;
  const thinkingSteps = message.metadata?.thinking_steps;
  const hasFiles = message.file_urls && message.file_urls.length > 0;
  const usedDeepThinking = message.metadata?.used_deep_thinking;
  const usedWebResearch = message.metadata?.used_web_research;
  const isVisualEdit = message.metadata?.is_visual_edit; // Check for visual edit flag

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-2">
        <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full flex items-center gap-2">
          <Check className="w-3 h-3 text-green-400" />
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <Card className={`p-4 chat-bubble ${
          isUser 
            ? 'bg-blue-500/10 border-blue-500/20' 
            : isError 
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <div className="space-y-3">
            {/* Enhanced Message Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium ${
                isUser ? 'text-blue-300' : 'text-purple-300'
              }`}>
                {isUser ? 'You' : isAssistant ? 'Multi-Agent Claude' : 'System'}
              </span>
              
              {isVisualEdit && (
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                  <Paintbrush className="w-3 h-3 mr-1" />
                  Visual Edit
                </Badge>
              )}

              {hasCode && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Code className="w-3 h-3 mr-1" />
                  Code Generated
                </Badge>
              )}
              
              {usedDeepThinking && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Brain className="w-3 h-3 mr-1" />
                  Deep Thinking
                </Badge>
              )}
              
              {usedWebResearch && (
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  <Search className="w-3 h-3 mr-1" />
                  Web Research
                </Badge>
              )}

              {hasFiles && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Image Analyzed
                </Badge>
              )}
              
              {thinkingTime && (
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {thinkingTime}s
                </Badge>
              )}
              
              {thinkingSteps && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {thinkingSteps} steps
                </Badge>
              )}
              
              {isError && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
              
              {isGenerating && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Thinking...
                </Badge>
              )}
            </div>

            {/* Attached Images */}
            {hasFiles && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.file_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Attached image ${index + 1}`}
                    className="max-w-xs max-h-48 rounded-lg border border-slate-600/50"
                  />
                ))}
              </div>
            )}

            {/* Message Text */}
            <div className={`prose max-w-none ${
              isUser ? 'text-slate-200' : 'text-slate-100'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>

            {/* Additional metadata and actions for AI responses */}
            {isAssistant && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {message.metadata?.features_added && (
                    <span>✨ {message.metadata.features_added} features</span>
                  )}
                  {message.metadata?.is_demo && (
                    <span>🎭 Demo mode</span>
                  )}
                  {hasCode && <span>📱 React Native + Expo</span>}
                </div>
                {hasHistory && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRevert(message)}
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Revert to this version
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
