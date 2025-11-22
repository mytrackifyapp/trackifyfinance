"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const PRODUCT_STORAGE_KEY = "trackify.products";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id;
  const { format } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load products from localStorage
    try {
      const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (stored) {
        const products = JSON.parse(stored);
        // Try to find by slug first, then by ID
        const foundProduct = products.find(
          (p) => p.slug === productId || p.id === productId
        );
        if (foundProduct) {
          // Increment view count
          foundProduct.views = (foundProduct.views || 0) + 1;
          const updatedProducts = products.map((p) =>
            p.id === foundProduct.id ? foundProduct : p
          );
          localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(updatedProducts));
          setProduct(foundProduct);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const handleBuyNow = () => {
    if (product?.paymentLink) {
      window.open(product.paymentLink, "_blank");
    } else {
      toast.error("No payment link available");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div>
            {product.imageUrl ? (
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted mb-4 shadow-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
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

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold">{product.name}</h1>
                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
              {product.category && (
                <Badge variant="outline" className="mb-4">
                  {product.category}
                </Badge>
              )}
              <div className="text-5xl font-bold my-6">{format(product.price || 0)}</div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Tags</h3>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

