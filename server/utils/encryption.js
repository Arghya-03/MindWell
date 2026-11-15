
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "ENCRYPTION_KEY must be a valid 64-character hexadecimal key"
    );
  }

  return Buffer.from(key, "hex");
};

// Encrypt journal content
const encryptText = (text) => {
  const key = getEncryptionKey();

  // Generate a unique 12-byte IV for every encryption
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encryptedContent: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

// Decrypt journal content
const decryptText = (encryptedContent, iv, authTag) => {
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(
    encryptedContent,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = {
  encryptText,
  decryptText,
};
