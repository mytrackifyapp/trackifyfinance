"use client";

import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "./button";
import Image from "next/image";

interface UploadthingButtonProps {
  value?: string;
  onChange: (url: string) => void;
  endpoint?: "productImage" | "imageUploader";
  className?: string;
}

export function UploadthingButton({
  value,
  onChange,
  endpoint = "imageUploader",
  className,
}: UploadthingButtonProps) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <Image
            src={value}
            alt="Uploaded"
            width={800}
            height={200}
            className="w-full h-48 object-cover rounded-md border"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
          <UploadButton
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                onChange(res[0].url);
              }
              setUploading(false);
            }}
            onUploadBegin={() => {
              setUploading(true);
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              setUploading(false);
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading || uploading) {
                  return (
                    <div className="flex items-center justify-center gap-2 text-gray-900 font-semibold">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  );
                }
                if (ready) {
                  return <span className="text-gray-900 font-semibold">Choose Image</span>;
                }
                return <span className="text-gray-600">Getting ready...</span>;
              },
              allowedContent({ ready, isUploading }) {
                if (!ready) return "Checking what you allow";
                if (isUploading) return "Uploading...";
                return `Images up to 4MB (PNG, JPG, GIF, WebP)`;
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

