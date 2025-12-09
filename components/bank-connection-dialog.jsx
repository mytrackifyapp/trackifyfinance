"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Loader2, Building2, CheckCircle2, AlertCircle, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getAvailableProviders } from "@/lib/bank-providers/provider-factory";

export function BankConnectionDialog({ open, onOpenChange, context = "PERSONAL", userCountry = null }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);

  // Get available providers based on country
  useEffect(() => {
    const providers = getAvailableProviders(userCountry);
    setAvailableProviders(providers);
    
    // Don't auto-select - let user choose
    // Only set initial state if dialog just opened and no provider selected
    if (open && !selectedProvider) {
      // Don't auto-select, show selection UI first
    }
  }, [userCountry, open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedProvider(null);
      setLinkToken(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const fetchLinkToken = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = provider === 'MONO' 
        ? '/api/bank-providers/mono/create-link-token'
        : '/api/plaid/create-link-token';
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create link token");
      }

      const data = await response.json();
      // Store the code/token (not the full widget URL, we'll construct it when needed)
      // This allows us to get the public key dynamically
      setLinkToken(data.link_token || data.mono_code);
    } catch (err) {
      console.error("Error fetching link token:", err);
      setError(err.message);
      toast.error(err.message || "Failed to initialize bank connection");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = useCallback(
    async (publicToken, metadata) => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = selectedProvider === 'MONO'
          ? '/api/bank-providers/mono/exchange-code'
          : '/api/plaid/exchange-public-token';

        const body = selectedProvider === 'MONO'
          ? {
              code: publicToken,
              institution_id: metadata.institution?.institution_id,
              institution_name: metadata.institution?.name,
              context,
            }
          : {
              public_token: publicToken,
              institution_id: metadata.institution?.institution_id,
              institution_name: metadata.institution?.name,
              context,
            };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to connect bank account");
        }

        const data = await response.json();
        
        toast.success(
          `Successfully connected ${data.accounts.length} account(s) from ${metadata.institution?.name || 'your bank'}`
        );
        
        // Reset and close
        setLinkToken(null);
        setSelectedProvider(null);
        onOpenChange(false);
        
        // Refresh the page to show new accounts
        window.location.reload();
      } catch (err) {
        console.error("Error exchanging token:", err);
        setError(err.message);
        toast.error(err.message || "Failed to connect bank account");
      } finally {
        setLoading(false);
      }
    },
    [context, onOpenChange, selectedProvider]
  );

  const handleMonoConnect = async () => {
    if (!linkToken) {
      await fetchLinkToken('MONO');
      return;
    }

    // Mono uses their widget - redirect to their connection page
    // The widget will redirect back to our callback URL with a code
    try {
      // Get public key from API and construct widget URL
      const publicKeyResponse = await fetch('/api/bank-providers/mono/get-public-key');
      if (!publicKeyResponse.ok) {
        throw new Error('Failed to get Mono public key');
      }
      const { publicKey } = await publicKeyResponse.json();
      
      if (!publicKey) {
        throw new Error('Mono public key is not configured');
      }
      
      // Mono widget URL - just needs the public key
      // The widget will handle the connection and redirect with a code
      const monoWidgetUrl = `https://connect.withmono.com/?key=${publicKey}`;
      
      window.location.href = monoWidgetUrl;
    } catch (err) {
      console.error('Error opening Mono widget:', err);
      toast.error(err.message || 'Failed to open Mono connection');
    }
  };

  const config = {
    token: selectedProvider === 'PLAID' ? linkToken : null,
    onSuccess,
    onExit: (err, metadata) => {
      if (err) {
        console.error("Plaid Link error:", err);
        setError(err.error_message || "Connection cancelled");
      }
    },
  };

  const { open: openPlaidLink, ready } = usePlaidLink(config);

  // Don't auto-open Plaid - wait for user to click button
  const handlePlaidConnect = () => {
    if (selectedProvider === 'PLAID' && ready && linkToken) {
      openPlaidLink();
    } else if (selectedProvider === 'PLAID' && !linkToken) {
      fetchLinkToken('PLAID');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Connect Your Bank Account
          </DialogTitle>
          <DialogDescription>
            Choose your bank connection provider and securely connect your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection - Always show if no provider selected */}
          {!selectedProvider && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Choose Your Bank Connection Provider</label>
              <div className="grid gap-3">
                {availableProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    variant={provider.recommended ? "default" : "outline"}
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {provider.id === 'MONO' ? (
                        <MapPin className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {provider.description}
                        </div>
                      </div>
                      {provider.recommended && (
                        <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Show provider info when selected */}
          {selectedProvider && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedProvider === 'MONO' ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {availableProviders.find(p => p.id === selectedProvider)?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProvider(null);
                    setLinkToken(null);
                    setError(null);
                  }}
                >
                  Change
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {availableProviders.find(p => p.id === selectedProvider)?.description}
              </p>
            </div>
          )}

          {loading && !linkToken && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Initializing secure connection...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Connection Error</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchLinkToken}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {selectedProvider === 'PLAID' && !linkToken && !loading && (
            <Button
              onClick={() => fetchLinkToken('PLAID')}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Initialize Plaid Connection
                </>
              )}
            </Button>
          )}

          {selectedProvider === 'PLAID' && linkToken && ready && !error && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Plaid Link is ready. Click the button below to connect your bank.
                </p>
                <Button
                  onClick={handlePlaidConnect}
                  disabled={loading || !ready}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Connect with Plaid
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {selectedProvider === 'MONO' && !linkToken && !loading && (
            <Button
              onClick={() => fetchLinkToken('MONO')}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Initialize Mono Connection
                </>
              )}
            </Button>
          )}

          {selectedProvider === 'MONO' && linkToken && !error && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Ready to connect with Mono. Click the button below to start.
                </p>
                <Button
                  onClick={handleMonoConnect}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Connect with Mono
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!selectedProvider && availableProviders.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Please select a provider to continue
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <p className="font-medium">Security & Privacy:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your bank credentials are never stored</li>
              <li>All connections are encrypted and secure</li>
              <li>You can disconnect at any time</li>
              <li>
                Powered by {selectedProvider === 'MONO' ? 'Mono (Nigeria)' : 'Plaid (International)'}
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

