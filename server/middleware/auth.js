import { db, firebaseAdmin } from "../config/firebase.js";

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    req.user = await firebaseAdmin.auth().verifyIdToken(token);
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
      const role = adminEmails.includes(req.user.email?.toLowerCase()) ? "admin" : "staff";
      const profile = {
        email: req.user.email || "",
        displayName: req.user.name || "",
        role,
        disabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await userRef.set(profile);
      await firebaseAdmin.auth().setCustomUserClaims(req.user.uid, { role });
      req.userProfile = profile;
    } else {
      req.userProfile = userDoc.data();
    }
    if (req.userProfile.disabled) return res.status(403).json({ message: "This account has been disabled." });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userProfile?.role !== "admin") return res.status(403).json({ message: "Administrator access required." });
  next();
}
