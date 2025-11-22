"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Copy, ExternalLink } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function ProductGrid({ products, onEdit, onDelete, onPreview, onCopyLink }) {
  const { format } = useCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {product.imageUrl && (
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                {product.category && (
                  <Badge variant="outline" className="mt-1">
                    {product.category}
                  </Badge>
                )}
              </div>
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                {product.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{format(product.price || 0)}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>{product.views || 0} views</span>
                  <span>{product.sales || 0} sales</span>
                </div>
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onPreview(product)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyLink(product)}
                title="Copy Product Link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product.id)}
                title="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

