// Only the browser client is safe to re-export from a barrel.
// Server and middleware clients import next/headers / next/server —
// import them directly to avoid pulling those into client bundles.
export { createClient as createBrowserSupabaseClient } from "./client";
