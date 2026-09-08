export function initSentry() {
  const dsn = typeof process !== "undefined" ? process.env["SENTRY_DSN"] : undefined;
  if (dsn) {
    console.log("[Sentry] Initialized with DSN:", dsn);
  } else {
    console.log("[Sentry] Standalone logging mode active (Add SENTRY_DSN to env to send to Sentry)");
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  const dsn = typeof process !== "undefined" ? process.env["SENTRY_DSN"] : undefined;
  const timestamp = new Date().toISOString();
  
  console.error(`[Sentry Error ${timestamp}]`, error, context ?? "");

  if (dsn) {
    // Post exception payload to Sentry DSN endpoint if configured
    try {
      fetch(dsn, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exception: { values: [{ type: "Error", value: String(error) }] },
          timestamp,
          extra: context,
        }),
      }).catch(() => {
        // Fallback swallow to avoid secondary crashes
      });
    } catch {
      // Fallback swallow
    }
  }
}
