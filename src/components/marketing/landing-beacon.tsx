"use client";

import { useEffect } from "react";

export function LandingBeacon() {
  useEffect(() => {
    if (window.sessionStorage.getItem("pk_landing")) return;
    window.sessionStorage.setItem("pk_landing", "1");
    const body = JSON.stringify({ name: "landing_view" });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/product", new Blob([body], { type: "application/json" }));
    else void fetch("/api/product", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  }, []);
  return null;
}
