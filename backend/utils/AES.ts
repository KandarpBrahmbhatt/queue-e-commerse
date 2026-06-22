import CryptoJS from "crypto-js";

// this file use of encryption data to decryption data using AES algorithm this is a configation file 

const secretKey = "fsfsdfsdfdfsfsdfdsfsgdggdgfdgfdpass123" // Secret key used for encryption & decryption

// encrypt

//  flow = > Original Data → AES Encrypt → Encrypted String  
export const encryptData = (text: string) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};
// flow => Encrypted → AES decrypt → original data
export const decryptData = (encryptedData: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

// This file does:
// encrypt
// decrypt