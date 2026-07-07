// const admin = require("firebase-admin");
// const logger = require("./logger");

// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//       }),
//     });
//     logger.info("Firebase Admin SDK initialized");
//   } catch (err) {
//     logger.error("Firebase Admin SDK init failed", err);
//   }
// }

// module.exports = admin;


const admin = require("firebase-admin");
const { getApps, initializeApp, cert } = require("firebase-admin/app");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

module.exports = admin;