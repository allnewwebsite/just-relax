export function formatDateDDMMYYYY(value) {
  if (!value) return "";
  const text = String(value);
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return isoDate[3] + "-" + isoDate[2] + "-" + isoDate[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text;
  return String(date.getDate()).padStart(2, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + date.getFullYear();
}
export function normalizeDateInput(value) {
  const parts = String(value || "").trim().split("-");
  if (parts.length !== 3 || parts[2].length !== 4) return value;
  return parts[2] + "-" + parts[1].padStart(2, "0") + "-" + parts[0].padStart(2, "0");
}
