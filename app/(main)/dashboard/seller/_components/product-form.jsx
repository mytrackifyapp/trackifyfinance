"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/components/currency-provider";
import { UploadthingButton } from "@/components/ui/uploadthing-button";

export function ProductForm({ product, onSave, onCancel }) {
  const { format } = useCurrency();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    paymentLink: "",
    downloadUrl: "",
    status: "active",
    tags: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "",
        imageUrl: product.imageUrl || "",
        paymentLink: product.paymentLink || "",
        downloadUrl: product.downloadUrl || "",
        status: product.status || "active",
        tags: product.tags?.join(", ") || "",
      });
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.paymentLink) {
      alert("Please fill in required fields (Name, Price, and Payment Link)");
      return;
    }
    
    const productData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    
    onSave(productData);
  };

  const categories = [
    "E-book",
    "Course",
    "Template",
    "Software",
    "Design Asset",
    "Music",
    "Video",
    "Photography",
    "Other",
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{product ? "Edit Product" : "Create New Product"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Ultimate Design Bundle"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your product in detail..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
                {formData.price > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {format(formData.price)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="design, bundle, premium"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <UploadthingButton
                value={formData.imageUrl}
                onChange={(url) => handleInputChange("imageUrl", url)}
                endpoint="productImage"
              />
              <p className="text-xs text-muted-foreground">
                Upload a product image (max 4MB). You can also paste an image URL below.
              </p>
              {formData.imageUrl && (
                <div className="mt-2">
                  <label className="text-sm font-medium">Or paste image URL</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment & Delivery</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Payment Link *</label>
                <Input
                  value={formData.paymentLink}
                  onChange={(e) => handleInputChange("paymentLink", e.target.value)}
                  placeholder="https://buy.stripe.com/... or https://paypal.me/..."
                  type="url"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Stripe payment link, PayPal.me link, or other payment gateway URL
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Download/Delivery URL</label>
                <Input
                  value={formData.downloadUrl}
                  onChange={(e) => handleInputChange("downloadUrl", e.target.value)}
                  placeholder="https://drive.google.com/... or https://gumroad.com/..."
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Link to deliver the product after payment (optional)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

