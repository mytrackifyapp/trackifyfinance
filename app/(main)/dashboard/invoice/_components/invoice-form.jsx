"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function InvoiceForm({ onSave, onCancel }) {
  const { format } = useCurrency();
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    notes: "",
    includePaymentDetails: false,
    paymentMethod: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    paymentLink: "",
    paypalEmail: "",
    otherPaymentInfo: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === "quantity" || field === "price" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (parseFloat(formData.taxRate || 0) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.businessName) {
      alert("Please fill in required fields (Business Name and Client Name)");
      return;
    }
    if (formData.items.some((item) => !item.description || item.price <= 0)) {
      alert("Please ensure all items have a description and valid price");
      return;
    }
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create New Invoice</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Number</label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Business Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name *</label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleInputChange("businessEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.businessPhone}
                  onChange={(e) => handleInputChange("businessPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name *</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-12 items-end border p-3 rounded-lg">
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Total</label>
                    <div className="h-9 flex items-center px-3 border rounded-md bg-muted">
                      {format(item.quantity * item.price)}
                    </div>
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="md:col-span-1"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includePaymentDetails"
                checked={formData.includePaymentDetails}
                onChange={(e) => handleInputChange("includePaymentDetails", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="includePaymentDetails" className="text-sm font-medium">
                Include Payment Details
              </label>
            </div>
            {formData.includePaymentDetails && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select payment method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="payment-link">Payment Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {formData.paymentMethod === "bank" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bank Name</label>
                      <Input
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                        placeholder="Bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Account Number</label>
                      <Input
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Routing Number</label>
                      <Input
                        value={formData.routingNumber}
                        onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                        placeholder="Routing number"
                      />
                    </div>
                  </div>
                )}
                {formData.paymentMethod === "paypal" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PayPal Email</label>
                    <Input
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                      placeholder="your-email@example.com"
                    />
                  </div>
                )}
                {formData.paymentMethod === "payment-link" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Link</label>
                    <Input
                      type="url"
                      value={formData.paymentLink}
                      onChange={(e) => handleInputChange("paymentLink", e.target.value)}
                      placeholder="https://payment-link.com"
                    />
                  </div>
                )}
                {formData.paymentMethod === "other" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Information</label>
                    <Input
                      value={formData.otherPaymentInfo}
                      onChange={(e) => handleInputChange("otherPaymentInfo", e.target.value)}
                      placeholder="Enter payment details"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tax and Notes */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => handleInputChange("taxRate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or terms"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{format(calculateSubtotal())}</span>
                </div>
                {formData.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tax ({formData.taxRate}%):
                    </span>
                    <span className="font-medium">{format(calculateTax())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{format(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

