import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment
function getEncryptionKey() {
  const key = process.env.PLAID_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('PLAID_ENCRYPTION_KEY environment variable is not set');
  }
  // Use first 32 bytes of the key
  return Buffer.from(key.slice(0, 32), 'utf8');
}

/**
 * Encrypt Plaid access token for secure storage
 */
export function encryptPlaidToken(token) {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key from salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha512');
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Return: salt:iv:tag:encrypted
    return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting Plaid token:', error);
    throw new Error('Failed to encrypt Plaid token');
  }
}

/**
 * Decrypt Plaid access token
 */
export function decryptPlaidToken(encryptedToken) {
  try {
    const key = getEncryptionKey();
    const parts = encryptedToken.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted token format');
    }
    
    const [saltHex, ivHex, tagHex, encrypted] = parts;
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    // Derive key from salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha512');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting Plaid token:', error);
    throw new Error('Failed to decrypt Plaid token');
  }
}

