import { db } from "../config/firebase.js";
import { ensureMarginMoney } from "./marginMoneyController.js";

const collection = () => {
  if (!db) throw new Error("Firebase Admin is not configured.");
  return db.collection("invoices");
};
const serialize = (doc) => {
  const value = doc.data();
  return { id: doc.id, ...value, createdAt: value.createdAt?.toDate?.().toISOString() || value.createdAt, updatedAt: value.updatedAt?.toDate?.().toISOString() || value.updatedAt };
};
export async function listInvoices(req, res, next) {
  try {
    const snap = req.userProfile.role === "admin"
      ? await collection().get()
      : await collection().where("userId", "==", req.user.uid).get();
    const items = snap.docs.map(serialize).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (error) { next(error); }
}
export async function getInvoice(req, res, next) {
  try {
    const doc = await collection().doc(req.params.id).get();
    if (!doc.exists || (req.userProfile.role !== "admin" && doc.data().userId !== req.user.uid)) return res.status(404).json({ message: "Invoice not found." });
    res.json(serialize(doc));
  } catch (error) { next(error); }
}
export async function createInvoice(req, res, next) {
  try {
    const now = new Date();
    const doc = await collection().add({ ...req.body, userId: req.user.uid, createdAt: now, updatedAt: now });
    await ensureMarginMoney(doc.id, { id: doc.id, ...req.body, userId: req.user.uid }, req.user.uid);
    res.status(201).json({ id: doc.id });
  } catch (error) { next(error); }
}
export async function updateInvoice(req, res, next) {
  try {
    const ref = collection().doc(req.params.id); const doc = await ref.get();
    if (!doc.exists || (req.userProfile.role !== "admin" && doc.data().userId !== req.user.uid)) return res.status(404).json({ message: "Invoice not found." });
    const { id, userId, createdAt, updatedAt, ...invoice } = req.body;
    await ref.update({ ...invoice, updatedAt: new Date() });
    res.json({ id: ref.id });
  } catch (error) { next(error); }
}
export async function deleteInvoice(req, res, next) {
  try {
    const ref = collection().doc(req.params.id); const doc = await ref.get();
    if (!doc.exists || (req.userProfile.role !== "admin" && doc.data().userId !== req.user.uid)) return res.status(404).json({ message: "Invoice not found." });
    await ref.delete(); res.status(204).end();
  } catch (error) { next(error); }
}
