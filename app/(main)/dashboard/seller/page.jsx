"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store, Copy, ExternalLink, Edit, Trash2, Eye, Grid, List } from "lucide-react";
import { ProductForm } from "./_components/product-form";
import { ProductGrid } from "./_components/product-grid";
import { ProductPreview } from "./_components/product-preview";
import { useCurrency } from "@/components/currency-provider";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { generateUniqueSlug, getProductUrl } from "@/lib/product-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRODUCT_STORAGE_KEY = "trackify.products";

export default function SellerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const { format } = useCurrency();

  useEffect(() => {
    // Load products from localStorage
    try {
      const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (stored) {
        let loadedProducts = JSON.parse(stored);
        
        // Migrate: ensure all products have slugs
        let needsUpdate = false;
        loadedProducts = loadedProducts.map((product) => {
          if (!product.slug && product.name) {
            const existingSlugs = loadedProducts.map((p) => p.slug).filter(Boolean);
            product.slug = generateUniqueSlug(product.name, existingSlugs);
            needsUpdate = true;
          }
          return product;
        });
        
        if (needsUpdate) {
          localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(loadedProducts));
        }
        
        setProducts(loadedProducts);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }, []);

  const saveProducts = (newProducts) => {
    try {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error("Error saving products:", error);
    }
  };

  const handleCreateProduct = (productData) => {
    // Generate unique slug
    const existingSlugs = products.map((p) => p.slug).filter(Boolean);
    const slug = generateUniqueSlug(productData.name, existingSlugs);
    
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...productData,
      slug,
      createdAt: new Date().toISOString(),
      views: 0,
      sales: 0,
      status: "active",
    };
    const updatedProducts = [newProduct, ...products];
    saveProducts(updatedProducts);
    setShowForm(false);
    toast.success("Product created successfully!");
  };

  const handleUpdateProduct = (productData) => {
    // Ensure slug exists (generate if missing or name changed)
    const existingProduct = products.find((p) => p.id === editingProduct.id);
    let slug = existingProduct?.slug;
    
    // Generate slug if missing or if name changed
    if (!slug || (productData.name && productData.name !== existingProduct.name)) {
      const existingSlugs = products.map((p) => p.slug).filter(Boolean);
      slug = generateUniqueSlug(productData.name || existingProduct.name, existingSlugs);
    }
    
    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id 
        ? { ...p, ...productData, slug, updatedAt: new Date().toISOString() } 
        : p
    );
    saveProducts(updatedProducts);
    setEditingProduct(null);
    setShowForm(false);
    toast.success("Product updated successfully!");
  };

  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      saveProducts(updatedProducts);
      if (previewProduct?.id === productId) {
        setPreviewProduct(null);
      }
      toast.success("Product deleted successfully!");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handlePreviewProduct = (product) => {
    setPreviewProduct(product);
  };

  const handleCopyLink = (product) => {
    const productUrl = getProductUrl(product);
    navigator.clipboard.writeText(productUrl);
    toast.success("Product link copied to clipboard!");
  };

  const handleCopyPaymentLink = (product) => {
    if (product.paymentLink) {
      navigator.clipboard.writeText(product.paymentLink);
      toast.success("Payment link copied to clipboard!");
    } else {
      toast.error("No payment link set for this product");
    }
  };

  const calculateTotalRevenue = () => {
    return products.reduce((sum, product) => {
      return sum + (parseFloat(product.price || 0) * (product.sales || 0));
    }, 0);
  };

  const calculateTotalSales = () => {
    return products.reduce((sum, product) => sum + (product.sales || 0), 0);
  };

  const activeProducts = products.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between -mt-4 mb-2">
        <p className="text-muted-foreground">
          Manage your digital products and track sales
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeProducts} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalSales()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(calculateTotalRevenue())}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.views || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All products</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Form */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}

      {/* Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <ProductPreview
              product={previewProduct}
              onClose={() => setPreviewProduct(null)}
              onCopyLink={() => handleCopyLink(previewProduct)}
              onCopyPaymentLink={() => handleCopyPaymentLink(previewProduct)}
            />
          </div>
        </div>
      )}

      {/* Products Display */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Start selling your digital products! Add your first product to get started.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <ProductGrid
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onPreview={handlePreviewProduct}
          onCopyLink={handleCopyLink}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{format(product.price || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.views || 0}</TableCell>
                    <TableCell>{product.sales || 0}</TableCell>
                    <TableCell className="font-medium">
                      {format((product.price || 0) * (product.sales || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreviewProduct(product)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(product)}
                          title="Copy Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

