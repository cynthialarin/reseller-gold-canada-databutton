import * as React from "react";
import { useZxing } from "react-zxing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  const [error, setError] = React.useState<string>();

  const {
    ref,
    torch: { on: torchOn, off: torchOff, isOn: isTorchOn },
  } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      setError(error.message);
    },
  });

  const toggleTorch = () => {
    if (isTorchOn) {
      torchOff();
    } else {
      torchOn();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
        <video ref={ref} className="w-full h-full object-cover" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={toggleTorch}>
          {isTorchOn ? "Turn Off Torch" : "Turn On Torch"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
