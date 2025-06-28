import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Target, MousePointer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VisualEditOverlay({ isActive, onClose, onElementSelect, previewElement }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setIsSelecting(true);
      document.body.style.cursor = 'crosshair';
    } else {
      setIsSelecting(false);
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isActive]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isSelecting) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleClick = (e) => {
      if (isSelecting && previewElement) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get click position relative to preview
        const previewRect = previewElement.getBoundingClientRect();
        const relativeX = e.clientX - previewRect.left;
        const relativeY = e.clientY - previewRect.top;
        
        // Calculate percentage position
        const percentX = (relativeX / previewRect.width) * 100;
        const percentY = (relativeY / previewRect.height) * 100;
        
        const elementInfo = {
          x: percentX,
          y: percentY,
          description: getElementDescription(percentX, percentY),
          timestamp: Date.now()
        };
        
        setSelectedElement(elementInfo);
        setIsSelecting(false);
        onElementSelect(elementInfo);
      }
    };

    if (isActive) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isSelecting, isActive, previewElement, onElementSelect]);

  const getElementDescription = (x, y) => {
    // Simple heuristic to guess what element was clicked based on position
    if (y < 15) return "Status bar or header";
    if (y < 25) return "Navigation or title area";
    if (y > 85) return "Bottom navigation or button area";
    if (x < 20 || x > 80) return "Side element or navigation";
    
    return "Main content area element";
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        ref={overlayRef}
      >
        {/* Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60">
          <Card className="bg-slate-900/90 border-slate-700 backdrop-blur-md">
            <div className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">
                  {isSelecting ? "Click on the element you want to edit" : "Element Selected"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Mouse follower when selecting */}
        {isSelecting && (
          <div
            className="absolute pointer-events-none z-60"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
            }}
          >
            <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              <MousePointer className="w-3 h-3 inline mr-1" />
              Click to select
            </div>
          </div>
        )}

        {/* Selection confirmation */}
        {selectedElement && !isSelecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-60"
          >
            <Card className="bg-slate-900/90 border-slate-700 backdrop-blur-md">
              <div className="p-4 text-center">
                <div className="text-green-400 mb-2">
                  ✓ Element selected!
                </div>
                <div className="text-sm text-slate-300 mb-3">
                  {selectedElement.description}
                </div>
                <div className="text-xs text-slate-400">
                  Position: {selectedElement.x.toFixed(1)}%, {selectedElement.y.toFixed(1)}%
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 z-60">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <div className="p-3">
              <div className="text-xs text-slate-400 space-y-1">
                <div>• Click on any element in the preview</div>
                <div>• Describe your desired changes</div>
                <div>• AI will modify the specific component</div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}