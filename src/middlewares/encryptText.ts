import crypto from 'crypto';

const encryptKey = process.env.ENCRYPT_KEY || 'MY_SECRET_KEY';
const algorithm = 'aes-256-ctr'; 
const ivLength = 16;

export function encrypt(text: string) : string{
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, encryptKey, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
} 

export function decrypt(encryptedText: string) : string{
    const iv = crypto.randomBytes(ivLength);
    const decipher = crypto.createDecipheriv(algorithm, encryptKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
} 