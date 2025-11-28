"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useRef, useState } from "react";

/**
 * Analytics Provider that ensures Analytics only initializes once
 * This prevents ERR_INSUFFICIENT_RESOURCES errors from repeated initialization
 * 
 * Uses a global flag to ensure only one instance of Analytics is ever mounted
 */
let analyticsInitialized = false;

export function AnalyticsProvider() {
  const [shouldRender, setShouldRender] = useState(!analyticsInitialized);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations across component instances
    if (analyticsInitialized || mountedRef.current) {
      setShouldRender(false);
      return;
    }
    
    analyticsInitialized = true;
    mountedRef.current = true;
  }, []);

  // Only render Analytics if it hasn't been initialized yet
  if (!shouldRender) {
    return null;
  }

  return <Analytics />;
}

