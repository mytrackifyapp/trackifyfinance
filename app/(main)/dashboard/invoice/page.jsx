"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Download, Trash2, Eye, X } from "lucide-react";
import { InvoiceForm } from "./_components/invoice-form";
import { InvoicePreview } from "./_components/invoice-preview";
import { InvoiceList } from "./_components/invoice-list";
import { useCurrency } from "@/components/currency-provider";
import { formatCurrency } from "@/lib/currency";

const INVOICE_STORAGE_KEY = "trackify.invoices";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const { format, currency } = useCurrency();

  useEffect(() => {
    // Load invoices from localStorage
    try {
      const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (stored) {
        setInvoices(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  }, []);

  const saveInvoices = (newInvoices) => {
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(newInvoices));
      setInvoices(newInvoices);
    } catch (error) {
      console.error("Error saving invoices:", error);
    }
  };

  const handleCreateInvoice = (invoiceData) => {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      status: "draft",
    };
    const updatedInvoices = [newInvoice, ...invoices];
    saveInvoices(updatedInvoices);
    setShowForm(false);
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);
      saveInvoices(updatedInvoices);
      if (previewInvoice?.id === invoiceId) {
        setPreviewInvoice(null);
      }
    }
  };

  const handlePreviewInvoice = (invoice) => {
    setPreviewInvoice(invoice);
  };

  const handleDownloadPDF = (invoice) => {
    // Create a printable version
    const printWindow = window.open("", "_blank");
    const content = generateInvoiceHTML(invoice);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const generateInvoiceHTML = (invoice) => {
    const total = invoice.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
      return sum + itemTotal;
    }, 0);
    const tax = total * (parseFloat(invoice.taxRate || 0) / 100);
    const finalTotal = total + tax;
    
    // Format currency for HTML
    const formatMoney = (amount) => formatCurrency(amount, currency);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-info { text-align: right; }
            .section { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; padding: 8px 0; }
            .total-row.grand-total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #000; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${invoice.businessName || "Your Business"}</h1>
              <p>${invoice.businessAddress || ""}</p>
              <p>${invoice.businessEmail || ""}</p>
              <p>${invoice.businessPhone || ""}</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="section">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clientName}</strong></p>
            <p>${invoice.clientEmail || ""}</p>
            <p>${invoice.clientAddress || ""}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(
                (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatMoney(item.price)}</td>
                  <td>${formatMoney(item.quantity * item.price)}</td>
                </tr>
              `
              ).join("")}
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-row">
              <span style="margin-right: 20px;">Subtotal:</span>
              <span>${formatMoney(total)}</span>
            </div>
            ${invoice.taxRate ? `
            <div class="total-row">
              <span style="margin-right: 20px;">Tax (${invoice.taxRate}%):</span>
              <span>${formatMoney(tax)}</span>
            </div>
            ` : ""}
            <div class="total-row grand-total">
              <span style="margin-right: 20px;">Total:</span>
              <span>${formatMoney(finalTotal)}</span>
            </div>
          </div>
          ${invoice.includePaymentDetails && invoice.paymentMethod ? `
          <div class="section" style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h3 style="margin-bottom: 10px; font-weight: bold;">Payment Details</h3>
            ${invoice.paymentMethod === "bank" ? `
              ${invoice.bankName ? `<p><strong>Bank Name:</strong> ${invoice.bankName}</p>` : ""}
              ${invoice.accountNumber ? `<p><strong>Account Number:</strong> ${invoice.accountNumber}</p>` : ""}
              ${invoice.routingNumber ? `<p><strong>Routing Number:</strong> ${invoice.routingNumber}</p>` : ""}
            ` : ""}
            ${invoice.paymentMethod === "paypal" && invoice.paypalEmail ? `
              <p><strong>PayPal:</strong> ${invoice.paypalEmail}</p>
            ` : ""}
            ${invoice.paymentMethod === "payment-link" && invoice.paymentLink ? `
              <p><strong>Payment Link:</strong> <a href="${invoice.paymentLink}">${invoice.paymentLink}</a></p>
            ` : ""}
            ${invoice.paymentMethod === "other" && invoice.otherPaymentInfo ? `
              <p><strong>Payment Information:</strong> ${invoice.otherPaymentInfo}</p>
            ` : ""}
          </div>
          ` : ""}
          ${invoice.notes ? `<div class="section"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ""}
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 mb-2">
        <p className="text-muted-foreground text-sm sm:text-base">
          Create and manage professional invoices for your business
        </p>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {showForm && (
        <InvoiceForm
          onSave={handleCreateInvoice}
          onCancel={() => setShowForm(false)}
        />
      )}

      {previewInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setPreviewInvoice(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <InvoicePreview
              invoice={previewInvoice}
              onDownload={() => handleDownloadPDF(previewInvoice)}
              onClose={() => setPreviewInvoice(null)}
            />
          </div>
        </div>
      )}

      <InvoiceList
        invoices={invoices}
        onPreview={handlePreviewInvoice}
        onDelete={handleDeleteInvoice}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}

