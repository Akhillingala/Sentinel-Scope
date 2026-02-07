#!/usr/bin/env node
/**
 * Quick script to verify Mapbox API token is configured and valid.
 * Run: node scripts/check-mapbox-api.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

async function checkMapbox() {
  const env = loadEnv();
  const token = env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.log("❌ Mapbox API: NOT CONFIGURED");
    console.log("   Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local");
    process.exit(1);
  }

  if (token === "your_mapbox_public_token" || token.length < 20) {
    console.log("❌ Mapbox API: PLACEHOLDER OR INVALID");
    console.log("   Replace with a real token from https://account.mapbox.com/access-tokens/");
    process.exit(1);
  }

  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log("✅ Mapbox API: OK (token valid)");
      process.exit(0);
    }
    const text = await res.text();
    if (res.status === 401) {
      console.log("❌ Mapbox API: UNAUTHORIZED");
      console.log("   Token is invalid or revoked.");
      process.exit(1);
    }
    console.log(`❌ Mapbox API: HTTP ${res.status}`);
    console.log("  ", text.slice(0, 200));
    process.exit(1);
  } catch (err) {
    console.log("❌ Mapbox API: REQUEST FAILED");
    console.log("  ", err.message);
    process.exit(1);
  }
}

checkMapbox();
