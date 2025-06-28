import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  QrCode,
  Play,
  RefreshCw,
  Wifi,
  Battery,
  Signal,
  ExternalLink,
  Zap,
  Target,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";

export default function PhonePreview({ project, previewUrl }) {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQR = async () => {
    if (!previewUrl) return;

    try {
      const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(previewUrl)}`);
      if (qrResponse.ok) {
        setQrCodeUrl(qrResponse.url);
        setQrGenerated(true);
      } else {
        setQrGenerated(true);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrGenerated(true);
    }
  };

  const renderSimulator = () => {
    if (project?.status === 'building') {
      return (
        <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6 rounded-[1.5rem]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-yellow-300 font-semibold mb-2">Building Your App</h4>
            <p className="text-slate-400 text-sm mb-4">Claude AI is generating code...</p>
            <div className="flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
            </div>
          </div>
        </div>
      );
    }

    if (!previewUrl || !project?.code) {
      return (
        <div className="h-full bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center rounded-[1.5rem]">
          <div className="text-center">
            <Smartphone className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h4 className="text-slate-300 font-semibold mb-2">Ready to Build</h4>
            <p className="text-slate-400 text-sm">
              Describe your app idea to see it come to life
            </p>
          </div>
        </div>
      );
    }

    // Use working Expo Snack embed - this is the correct way to embed Expo apps
    return (
      <iframe
        src={previewUrl}
        className="w-full h-full border-0 rounded-[1.5rem]"
        title="Expo Snack Preview"
        allow="geolocation; camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
        loading="lazy"
      ></iframe>
    );
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Live Preview</h3>
            <p className="text-slate-400 text-sm">Real-time Expo Snack simulation</p>
          </div>
        </div>
      </div>

      {/* Phone Mockup with Expo Snack */}
      <div className="flex-1 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="phone-mockup rounded-[2.5rem] p-3 w-64 h-[32rem] relative bg-black"
        >
          {/* Phone Frame */}
          <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-black text-white text-xs flex justify-between items-center px-6 py-2 relative z-10">
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
              </div>
              <div className="font-mono">9:41 AM</div>
              <div className="flex items-center gap-1">
                <span className="text-xs">100%</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Expo Snack Simulator */}
            <div className="absolute top-8 bottom-0 left-0 right-0 bg-white rounded-b-[1.5rem] overflow-hidden">
              {renderSimulator()}
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full"></div>
        </motion.div>

        {/* Action Buttons */}
        {project?.status === 'ready' && previewUrl && (
          <div className="w-full mt-4 space-y-2">
            <Button
              onClick={() => window.open(previewUrl, '_blank')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
            >
              <Play className="w-4 h-4 mr-2" />
              Open in Full Expo Snack
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={generateQR}
              variant="outline"
              className="w-full bg-slate-800/50 border-slate-600/50 text-slate-300"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code for Device
            </Button>
          </div>
        )}

        {/* QR Code Section */}
        {qrGenerated && (
          <Card className="w-full mt-6 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Scan with Expo GO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full rounded-lg" />
                  ) : (
                    <p className="text-black text-sm">QR Code</p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✅ Ready to scan!</p>
                  <p className="text-slate-400">
                    Use Expo GO app to scan and run on your device.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}