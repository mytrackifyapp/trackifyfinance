/**
 * Simple encryption utility for API keys
 * In production, consider using a more robust solution like AWS KMS
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production";

// Simple XOR encryption (for development)
// In production, use proper encryption like AES-256
export function encrypt(text) {
  if (!text) return null;
  try {
    // Simple base64 encoding for now
    // TODO: Implement proper encryption in production
    return Buffer.from(text).toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    return Buffer.from(encryptedText, "base64").toString("utf-8");
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

