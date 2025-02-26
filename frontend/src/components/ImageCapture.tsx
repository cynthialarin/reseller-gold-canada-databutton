import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Camera, Upload, Barcode } from 'lucide-react';

interface Props {
  onImageCaptured: (imageData: string) => void;
  onBarcodeScanned: (barcode: string) => void;
}

export function ImageCapture({ onImageCaptured, onBarcodeScanned }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [showBarcodeInput, setShowBarcodeInput] = React.useState(false);
  const [barcode, setBarcode] = React.useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onImageCaptured(imageData);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      toast.error('Unable to access camera');
      console.error('Camera error:', error);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    onImageCaptured(imageData);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onBarcodeScanned(barcode.trim());
      setShowBarcodeInput(false);
      setBarcode('');
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (showCamera) {
    return (
      <Card className="p-6 space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button onClick={captureImage} className="bg-white text-black hover:bg-gray-200">
              Capture
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (showBarcodeInput) {
    return (
      <Card className="p-6 space-y-4">
        <form onSubmit={handleBarcodeSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter UPC/Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex gap-4">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBarcodeInput(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          className="bg-white text-black hover:bg-gray-200 h-32"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} />
            <span>Upload Photo</span>
          </div>
        </Button>

        <Button
          className="bg-white text-black hover:bg-gray-200 h-32"
          onClick={startCamera}
        >
          <div className="flex flex-col items-center gap-2">
            <Camera size={24} />
            <span>Take Picture</span>
          </div>
        </Button>

        <Button
          className="bg-white text-black hover:bg-gray-200 h-32"
          onClick={() => setShowBarcodeInput(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <Barcode size={24} />
            <span>Scan UPC</span>
          </div>
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </Card>
  );
}
