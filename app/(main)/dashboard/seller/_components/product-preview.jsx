"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Copy, ExternalLink, Eye, ShoppingCart } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { toast } from "sonner";
import { getProductUrl } from "@/lib/product-utils";

export function ProductPreview({ product, onClose, onCopyLink, onCopyPaymentLink }) {
  const { format } = useCurrency();

  const handleBuyNow = () => {
    if (product.paymentLink) {
      window.open(product.paymentLink, "_blank");
    } else {
      toast.error("No payment link available");
    }
  };

  const handleCopyProductLink = () => {
    const productUrl = getProductUrl(product);
    navigator.clipboard.writeText(productUrl);
    toast.success("Product link copied!");
    if (onCopyLink) onCopyLink();
  };

  const handleCopyPayment = () => {
    if (product.paymentLink) {
      navigator.clipboard.writeText(product.paymentLink);
      toast.success("Payment link copied!");
      if (onCopyPaymentLink) onCopyPaymentLink();
    } else {
      toast.error("No payment link available");
    }
  };

  return (
    <div className="p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Product Image */}
          <div>
            {product.imageUrl ? (
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center mb-4">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}

            {/* Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{product.views || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{product.sales || 0}</div>
                    <div className="text-xs text-muted-foreground">Sales</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {format((product.price || 0) * (product.sales || 0))}
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
              {product.category && (
                <Badge variant="outline" className="mb-4">
                  {product.category}
                </Badge>
              )}
              <div className="text-4xl font-bold my-4">{format(product.price || 0)}</div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Link */}
            {product.paymentLink && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={product.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex-1 truncate"
                      >
                        {product.paymentLink}
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCopyPayment}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Payment Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Download Link */}
            {product.downloadUrl && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Download Link</h3>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex-1 truncate"
                    >
                      {product.downloadUrl}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button
                className="w-full"
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.paymentLink}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyProductLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Product Link
              </Button>
            </div>

            {/* Product Info */}
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p>Product ID: {product.id}</p>
              <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              {product.updatedAt && (
                <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

