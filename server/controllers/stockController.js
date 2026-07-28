import { db } from "../config/firebase.js";

const allowedFields = [
  "location", "registerNumber", "carModel", "vinNumber", "engineNumber", "keyNumber",
  "color", "variant", "vehicleAge", "remarks", "holdBy", "pdiStatus",
];
const requiredFields = [
  "location", "registerNumber", "carModel", "vinNumber", "engineNumber", "keyNumber",
  "color", "variant", "vehicleAge", "pdiStatus",
];
const collection = () => db.collection("availableStock");
const clean = (body) => Object.fromEntries(allowedFields.map((field) => [field, String(body[field] || "").trim()]));
const serialize = (doc) => {
  const value = doc.data();
  return {
    id: doc.id,
    ...value,
    createdAt: value.createdAt?.toDate?.().toISOString() || value.createdAt,
    updatedAt: value.updatedAt?.toDate?.().toISOString() || value.updatedAt,
  };
};
const validate = (vehicle) => requiredFields.find((field) => !vehicle[field]);

export async function listStock(_req, res, next) {
  try {
    const snapshot = await collection().get();
    const vehicles = snapshot.docs.map(serialize)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(vehicles);
  } catch (error) { next(error); }
}

export async function getStockVehicle(req, res, next) {
  try {
    const doc = await collection().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Vehicle not found." });
    res.json(serialize(doc));
  } catch (error) { next(error); }
}

export async function createStockVehicle(req, res, next) {
  try {
    const vehicle = clean(req.body);
    const missing = validate(vehicle);
    if (missing) return res.status(400).json({ message: `${missing} is required.` });
    const duplicate = await collection().where("vinNumber", "==", vehicle.vinNumber).limit(1).get();
    if (!duplicate.empty) return res.status(409).json({ message: "A vehicle with this VIN Number already exists." });
    const now = new Date();
    const doc = await collection().add({
      ...vehicle, status: "Available", createdAt: now, updatedAt: now, createdBy: req.user.uid,
    });
    res.status(201).json({ id: doc.id });
  } catch (error) { next(error); }
}

export async function updateStockVehicle(req, res, next) {
  try {
    const ref = collection().doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ message: "Vehicle not found." });
    const vehicle = clean(req.body);
    const missing = validate(vehicle);
    if (missing) return res.status(400).json({ message: `${missing} is required.` });
    const duplicate = await collection().where("vinNumber", "==", vehicle.vinNumber).limit(2).get();
    if (duplicate.docs.some((doc) => doc.id !== req.params.id)) {
      return res.status(409).json({ message: "A vehicle with this VIN Number already exists." });
    }
    await ref.update({ ...vehicle, status: "Available", updatedAt: new Date() });
    res.json({ id: ref.id });
  } catch (error) { next(error); }
}

export async function removeStockVehicle(req, res, next) {
  try {
    const ref = collection().doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ message: "Vehicle not found." });
    await ref.delete();
    res.status(204).end();
  } catch (error) { next(error); }
}
