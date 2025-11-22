"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InvoicePreview({ invoice, onDownload, onClose }) {
  const { format } = useCurrency();

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (parseFloat(invoice.taxRate || 0) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold mb-2">{invoice.businessName || "Your Business"}</h1>
            {invoice.businessAddress && <p className="text-sm text-muted-foreground">{invoice.businessAddress}</p>}
            {invoice.businessEmail && <p className="text-sm text-muted-foreground">{invoice.businessEmail}</p>}
            {invoice.businessPhone && <p className="text-sm text-muted-foreground">{invoice.businessPhone}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-4">INVOICE</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>}
          {invoice.clientAddress && <p className="text-sm text-muted-foreground">{invoice.clientAddress}</p>}
        </div>

        {/* Items Table */}
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{format(item.price)}</TableCell>
                <TableCell className="text-right font-medium">
                  {format(item.quantity * item.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{format(subtotal)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">{format(tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span>{format(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {invoice.includePaymentDetails && invoice.paymentMethod && (
          <div className="mb-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Payment Details</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {invoice.paymentMethod === "bank" && (
                <>
                  {invoice.bankName && <p className="text-sm"><strong>Bank Name:</strong> {invoice.bankName}</p>}
                  {invoice.accountNumber && <p className="text-sm"><strong>Account Number:</strong> {invoice.accountNumber}</p>}
                  {invoice.routingNumber && <p className="text-sm"><strong>Routing Number:</strong> {invoice.routingNumber}</p>}
                </>
              )}
              {invoice.paymentMethod === "paypal" && invoice.paypalEmail && (
                <p className="text-sm"><strong>PayPal:</strong> {invoice.paypalEmail}</p>
              )}
              {invoice.paymentMethod === "payment-link" && invoice.paymentLink && (
                <p className="text-sm">
                  <strong>Payment Link:</strong>{" "}
                  <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {invoice.paymentLink}
                  </a>
                </p>
              )}
              {invoice.paymentMethod === "other" && invoice.otherPaymentInfo && (
                <p className="text-sm"><strong>Payment Information:</strong> {invoice.otherPaymentInfo}</p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6 pt-6 border-t">
            <p className="text-sm"><strong>Notes:</strong> {invoice.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download / Print
          </Button>
        </div>
      </div>
    </div>
  );
}

