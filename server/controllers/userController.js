import { db, firebaseAdmin } from "../config/firebase.js";

const publicUser = (record, profile = {}) => ({
  uid: record.uid,
  email: record.email || "",
  displayName: record.displayName || profile.displayName || "",
  role: profile.role || record.customClaims?.role || "staff",
  disabled: record.disabled,
  createdAt: record.metadata.creationTime,
  lastSignInAt: record.metadata.lastSignInTime || null,
});

export function getCurrentUser(req, res) {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    displayName: req.userProfile.displayName || req.user.name || "",
    role: req.userProfile.role,
  });
}

export async function listUsers(_req, res, next) {
  try {
    const result = await firebaseAdmin.auth().listUsers(1000);
    const profiles = await Promise.all(result.users.map((user) => db.collection("users").doc(user.uid).get()));
    res.json(result.users.map((user, index) => publicUser(user, profiles[index].data())));
  } catch (error) { next(error); }
}

export async function createUser(req, res, next) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const displayName = String(req.body.displayName || "").trim();
  const role = req.body.role === "admin" ? "admin" : "staff";
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "A valid email is required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
  try {
    const user = await firebaseAdmin.auth().createUser({ email, password, displayName, emailVerified: false });
    await firebaseAdmin.auth().setCustomUserClaims(user.uid, { role });
    await db.collection("users").doc(user.uid).set({
      email, displayName, role, disabled: false, createdAt: new Date(), updatedAt: new Date(),
      createdBy: req.user.uid,
    });
    res.status(201).json(publicUser(user, { role }));
  } catch (error) {
    if (error.code === "auth/email-already-exists") return res.status(409).json({ message: "An account with this email already exists." });
    if (error.code === "auth/invalid-password") return res.status(400).json({ message: "The password does not meet Firebase requirements." });
    next(error);
  }
}

export async function updateUser(req, res, next) {
  const { uid } = req.params;
  const role = req.body.role === "admin" ? "admin" : "staff";
  const disabled = Boolean(req.body.disabled);
  if (uid === req.user.uid && (disabled || role !== "admin")) {
    return res.status(400).json({ message: "You cannot disable or remove your own administrator access." });
  }
  const update = { disabled };
  if (typeof req.body.displayName === "string") update.displayName = req.body.displayName.trim();
  if (req.body.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    update.password = String(req.body.password);
  }
  try {
    const user = await firebaseAdmin.auth().updateUser(uid, update);
    await firebaseAdmin.auth().setCustomUserClaims(uid, { role });
    await db.collection("users").doc(uid).set({
      email: user.email || "", displayName: user.displayName || "", role, disabled, updatedAt: new Date(),
    }, { merge: true });
    res.json(publicUser(user, { role }));
  } catch (error) { next(error); }
}
