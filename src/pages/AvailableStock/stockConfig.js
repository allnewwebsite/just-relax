export const HYUNDAI_MODELS = Object.freeze([
  "EXTER", "AURA", "AURA PRIME", "GRAND i10 NIOS", "i20", "CRETA", "VENUE", "VERNA", "ALCAZAR",
]);
export const LOCATIONS = Object.freeze(["Showroom", "Parking"]);
export const PDI_STATUSES = Object.freeze(["Done", "Not Done"]);
export const emptyVehicle = {
  location: "", registerNumber: "", carModel: "", vinNumber: "", engineNumber: "",
  keyNumber: "", color: "", variant: "", vehicleAge: "", remarks: "", holdBy: "",
  pdiStatus: "", status: "Available",
};

export function formatStockDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}-${month}-${year}` : value;
}
