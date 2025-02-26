import * as React from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import brain from "brain";
import { toast } from "sonner";

interface Props {
  onUpload: (imageUrl: string) => void;
}

export function ImageUpload({ onUpload }: Props) {
  const [processing, setProcessing] = React.useState(false);
  const [removeBackground, setRemoveBackground] = React.useState(false);
  const [preview, setPreview] = React.useState<string>();

  const processImage = async (base64Image: string) => {
    try {
      setProcessing(true);
      const response = await brain.process_image({
        body: {
          image_data: base64Image,
          remove_background: removeBackground,
          make_square: true,
        },
      });
      const data = await response.json();
      onUpload(data.processed_image);
      setPreview(data.processed_image);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result as string;
          processImage(base64Image);
        };
        reader.readAsDataURL(file);
      }
    },
    [removeBackground]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <Card className="p-4 space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-64 rounded-lg"
          />
        ) : processing ? (
          <div className="py-8">Processing...</div>
        ) : (
          <div className="py-8">
            {isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remove-bg"
          checked={removeBackground}
          onCheckedChange={(checked) => setRemoveBackground(checked as boolean)}
        />
        <Label htmlFor="remove-bg">Remove background</Label>
      </div>

      {preview && (
        <Button
          variant="outline"
          onClick={() => {
            setPreview(undefined);
          }}
        >
          Clear
        </Button>
      )}
    </Card>
  );
}
