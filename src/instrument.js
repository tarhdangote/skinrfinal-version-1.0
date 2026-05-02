/**
 * SKINR — Sentry Error Monitoring
 * src/instrument.js
 *
 * Loaded as the FIRST import in main.jsx.
 * Captures every unhandled error, failed API call, and payment failure
 * before they reach the user — and alerts you immediately.
 *
 * Free tier: 5,000 errors/month — more than enough for SKINR at launch.
 * Session replay: watch exactly what a user did before an error occurred.
 *
 * DSN is set via VITE_SENTRY_DSN environment variable in Netlify.
 * Add it at: Netlify → Site Configuration → Environment Variables
 */

import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;

// Only initialise in production or when DSN is explicitly set
// Never runs in local development unless you set VITE_SENTRY_DSN in .env.local
if (dsn && import.meta.env.MODE !== "development") {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || "production",
    release: "skinr@2.0.0",

    integrations: [
      // Tracks page loads, navigation, and API call performance
      Sentry.browserTracingIntegration(),
      // Records user session as a video-like replay when an error occurs
      // You can watch exactly what the user did before the crash
      Sentry.replayIntegration({
        maskAllText: true,       // Privacy — masks all text in replays
        blockAllMedia: false,
      }),
    ],

    // Performance: capture 20% of sessions for tracing
    // Increase to 1.0 (100%) temporarily when debugging a specific issue
    tracesSampleRate: 0.2,

    // Replay: record 5% of normal sessions, 100% when an error occurs
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Propagate traces to Netlify Functions for end-to-end request tracking
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/tryskinr\.com/,
      /^\/.netlify\/functions\//,
    ],

    // Filter out noise — errors we do not care about
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed",
      "Non-Error promise rejection",
      "NetworkError when attempting to fetch resource",
      "Load failed",                    // iOS Safari network blips
      "ChunkLoadError",                 // CDN cache misses on deploys
      /^Script error/,                  // Cross-origin script errors
    ],

    // Add user context when available — helps filter errors by user
    beforeSend(event, hint) {
      // Never send events that look like browser extension errors
      if (event.exception?.values?.[0]?.stacktrace?.frames) {
        const frames = event.exception.values[0].stacktrace.frames;
        const isExtension = frames.some(f =>
          f.filename?.includes("chrome-extension://") ||
          f.filename?.includes("moz-extension://")
        );
        if (isExtension) return null;
      }
      return event;
    },
  });
}

export { Sentry };
