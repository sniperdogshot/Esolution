import { createServerFn } from "@tanstack/react-start";

// GA4 measurement IDs are public by nature; returned so the browser can load gtag after consent.
export const getGaId = createServerFn({ method: "GET" }).handler(async () => {
  return { id: process.env['GOOGLE_ANALYTICS_MEASUREMENT_ID'] || "G-ZZ8V9X5L3B" };
});
