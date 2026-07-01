const crypto = require("crypto");
//Advanced Encryption Standard (AES)
//Cipher Block Chaining (cbc)
const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = crypto
  .createHash("sha256") //it creates a 32 byte hash object
  .update(process.env.BANK_ENCRYPTION_KEY) //suppose we have a secret key in .env and that is BANK_ENCRYPTION_KEY=mySuperSecretPassword ---------> sha256(mySuperSecretPassword)
  .digest(); // digest() it actually generates the hash 32 byte binary key

function encrypt(text) {
  //iv == initialize vector it prevents the same plaintext to be encrypted to the same ciphertext
  //example : 123456 = 5h3h4h3 , 123456 = b3b3jnnd8 , same account but different iv so different ciphertext
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    SECRET_KEY,
    iv, // create a unique iv === ALOGORITHM + SECRET_KEY + IV (b3b3jnnd8)
  );
  //Buffer.concat() = = = join both encrypted part like part 1 + part2 == complete encrypted data
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]); /// utf8 = = = convert string into bytes
  //cipher.final() = = = encryption useally happens in chunk like update (value passing) -> final() ->complet

  //return == give binary data into readable text
  //9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 === qwertyuiooooooopsdfghjk

  //example iv = ab98fe... Encrypted == 9ff124... store in DB = ((((((((((((((((((((((ab98fe:9ff124))))))))))))))))))))))))))))
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// (((((((((((((((((((payload ==== ab98fe:9ff124)))))))))))))))))))
function decrypt(payload) {
  //split ivhex = ab98fe and encryptedHex = 9ff124
  const [ivHex, encryptedHex] = payload.split(":");
  //convert hex string totototototo binary [because crypto works on binary]
  const iv = Buffer.from(ivHex, "hex");
  //convert encrypted text back to  binary [because crypto works on binary]
  const encryptedText = Buffer.from(encryptedHex, "hex");
  //decrypt machine with same algorithm and secret key and iv
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  //Buffer.concat() = = = join both decrypted part like part 1 + part2 == complete decrypted data
  const decrypted = Buffer.concat([
    //Starts decryption.
    decipher.update(encryptedText),
    //Finalize decryption
    decipher.final(),
  ]);
  return decrypted.toString("utf8"); //convert byte[binary] into string result = 1234567890123456
}

function maskAccountNumber(decrypted) {
    //if null , undefined , less than 4 so return ****** 
  if (!decrypted || decrypted.length < 4) return "****";
  //else Take the last 4 characters output == ******3456
  return `****${decrypted.slice(-4)}`;
}

module.exports = { encrypt , decrypt , maskAccountNumber};


//EXAMPLE EXAMPLE EXAMPLE
// const encrypted = encrypt("1234567890123456");

// const original = decrypt(encrypted);

// const masked = maskAccountNumber(original);

// console.log(encrypted);
// // e.g. "8ab4fd...:c9834de9..."

// console.log(original);
// // "1234567890123456"

// console.log(masked);
// // "****3456"


// User enters account number
//         │
//         ▼
// "1234567890123456"
//         │
//         ▼
// Generate Secret Key (from .env)
//         │
//         ▼
// Generate Random IV
//         │
//         ▼
// AES-256-CBC Encryption
//         │
//         ▼
// Store:
// IV:EncryptedData
//         │
//         ▼
// ────────── Later ──────────
//         │
//         ▼
// Read from Database
//         │
//         ▼
// Split IV and Encrypted Data
//         │
//         ▼
// Use Same Secret Key
//         │
//         ▼
// AES-256-CBC Decryption
//         │
//         ▼
// Original Account Number
//         │
//         ▼
// Mask Last 4 Digits
//         │
//         ▼
// ****3456