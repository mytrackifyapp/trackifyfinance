"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { getCurrentUser, updateProfile } from "@/actions/user";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "XOF", label: "West African CFA franc (CFA)" }, // Benin, Burkina Faso, Côte d’Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo
  { code: "GMD", label: "Gambian Dalasi (D)" },
  { code: "SLL", label: "Sierra Leonean Leone (Le)" },
  { code: "LRD", label: "Liberian Dollar (L$)" },
  { code: "CVE", label: "Cape Verdean Escudo (Esc)" },
  { code: "MRU", label: "Mauritanian Ouguiya (UM)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "ZAR", label: "South African Rand (R)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "INR", label: "Indian Rupee (₹)" },
];

const CURRENCY_STORAGE_KEY = "trackify.preferredCurrency";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USD");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    data: userData,
    loading: userLoading,
    fn: loadUser,
  } = useFetch(getCurrentUser);

  const {
    loading: updating,
    data: updateResult,
    fn: updateFn,
  } = useFetch(updateProfile);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored) setCurrency(stored);
    } catch {}
    loadUser();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setImageUrl(userData.imageUrl || "");
    }
  }, [userData]);

  useEffect(() => {
    if (updateResult?.success && !updating) {
      toast.success("Profile updated successfully");
    }
  }, [updateResult, updating]);

  const options = useMemo(() => CURRENCIES, []);

  const handleSave = () => {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      const selected = options.find((o) => o.code === currency)?.label || currency;
      toast.success(`Currency updated to ${selected}`);
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile / Account (Custom) */}
      <div className="lg:col-span-2 rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="grid gap-4 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Email</label>
            <Input value={email} disabled />
            <p className="text-xs text-gray-500">
              Email is managed by your authentication provider.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Avatar URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => updateFn({ name, imageUrl })}
              disabled={updating || userLoading}
            >
              {updating ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-3">App preferences</h2>
          <label className="text-sm text-gray-600 mb-2 block">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            {options.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={handleSave}>Save</Button>
            {saved && <span className="text-xs text-green-600">Saved</span>}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            This preference is stored on your device for now. If you want it
            synced across devices, I can wire it to your database.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-3">Session</h2>
          <SignOutButton>
            <Button variant="outline" className="w-full">
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

