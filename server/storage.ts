// Storage helpers - using local file system or S3
// For production, configure AWS S3

import fs from "fs";
import path from "path";
import { ENV } from "./_core/env";

const STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(STORAGE_DIR, key);

  try {
    // Create directories if needed
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    const buffer = typeof data === "string" ? Buffer.from(data) : data;
    fs.writeFileSync(filePath, buffer);

    // Generate URL (relative path for local, absolute for production)
    const url = `/storage/${key}`;

    return { key, url };
  } catch (error) {
    console.error("Storage upload failed:", error);
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const url = `/storage/${key}`;

  return { key, url };
}
