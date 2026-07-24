import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
const missing = required.filter((key) => !process.env[key]);
const serviceAccountPath = path.resolve("service-account.json");
const hasServiceAccountFile = fs.existsSync(serviceAccountPath);

if (!admin.apps.length) {
  if (hasServiceAccountFile) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (!missing.length) {
    admin.initializeApp({ credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }) });
  } else {
    console.warn(`Firebase Admin is missing: ${missing.join(", ")}`);
  }
}
export const firebaseAdmin = admin;
export const db = admin.apps.length ? admin.firestore() : null;
