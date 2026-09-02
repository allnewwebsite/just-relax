import { db } from "../config/firebase.js";

const collection = () => {
  if (!db) throw new Error("Firebase Admin is not configured.");
  return db.collection("marginMoney");
};

const invoiceFields = (invoice) => ({
  dealerGst: invoice.dealerGst || "",
  customerId: invoice.customerId || "",
  customerName: invoice.customerName || "",
  customerAddress: invoice.customerAddress || "",
  model: invoice.vehicleDescription || "",
  variant: invoice.variant || "",
  hypothecation: invoice.financedBy || "Not applicable",
  dealerName: invoice.dealerName || "",
});
const getInvoice = async (invoiceId) => {
  const doc = await db.collection("invoices").doc(invoiceId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};
const canAccess = (req, invoice) => req.userProfile.role === "admin" || invoice.userId === req.user.uid;
const receiptNumber = (invoiceId, date = new Date()) => "PR" + date.getFullYear() + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0") + invoiceId;
const serialize = (doc, invoice) => ({ id: doc.id, ...doc.data(), ...invoiceFields(invoice), createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt, updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || doc.data().updatedAt });

export async function ensureMarginMoney(invoiceId, invoice, uid) {
  const ref = collection().doc(invoiceId);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) return;
    const now = new Date();
    transaction.create(ref, { invoiceId, ...invoiceFields(invoice), receiptNumber: receiptNumber(invoiceId, now), receiptDate: "", paymentMode: "", transactionNumber: "", transactionDate: "", drawnOn: "", amount: 0, onAccountOf: "", createdAt: now, updatedAt: now, createdBy: uid });
  });
  return ref.id;
}

async function authorize(req, invoiceId) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice || !canAccess(req, invoice)) return { status: 404, message: "Invoice not found." };
  return { invoice };
}

export async function getMarginMoney(req, res, next) {
  try {
    const result = await authorize(req, req.params.id);
    if (result.status) return res.status(result.status).json({ message: result.message });
    const doc = await collection().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Margin Money record not found." });
    res.json(serialize(doc, result.invoice));
  } catch (error) { next(error); }
}

export async function createMarginMoney(req, res, next) {
  try {
    const result = await authorize(req, req.params.id);
    if (result.status) return res.status(result.status).json({ message: result.message });
    await ensureMarginMoney(req.params.id, result.invoice, req.user.uid);
    res.status(201).json(serialize(await collection().doc(req.params.id).get(), result.invoice));
  } catch (error) { next(error); }
}

export async function updateMarginMoney(req, res, next) {
  try {
    const result = await authorize(req, req.params.id);
    if (result.status) return res.status(result.status).json({ message: result.message });
    const ref = collection().doc(req.params.id);
    if (!(await ref.get()).exists) await ensureMarginMoney(req.params.id, result.invoice, req.user.uid);
    const allowed = ["receiptDate", "paymentMode", "transactionNumber", "transactionDate", "drawnOn", "amount", "onAccountOf"];
    const changes = Object.fromEntries(allowed.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field)).map((field) => [field, field === "amount" ? Math.max(0, Math.round(Number(req.body[field]) || 0)) : String(req.body[field] || "").trim()]));
    await ref.update({ ...changes, updatedAt: new Date() });
    res.json(serialize(await ref.get(), result.invoice));
  } catch (error) { next(error); }
}
