"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "tokitotv_adblock_dismissed";

export default function AdBlockerPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5h13.856" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Important: Install Ad Blocker
          </h2>
          <p className="text-muted leading-relaxed">
            To watch anime <span className="text-foreground font-semibold">without ad redirects and popups</span>, please install the <span className="text-primary font-semibold">uBlock Origin</span> browser extension.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h3l-4-4-4 4h3z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-foreground font-semibold">uBlock Origin</p>
              <p className="text-muted text-sm">Free, open-source ad blocker</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-foreground font-semibold hover:bg-primary/80 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Install for Chrome
          </a>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground font-semibold hover:bg-card-hover transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Install for Firefox
          </a>
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odlpfhlnaoaibninnkknlojlhdhmpbfg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground font-semibold hover:bg-card-hover transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Install for Edge
          </a>
        </div>

        <button
          onClick={dismiss}
          className="w-full mt-4 px-4 py-2 text-muted text-sm hover:text-foreground transition-colors"
        >
          I already have an ad blocker — dismiss
        </button>
      </div>
    </div>
  );
}
