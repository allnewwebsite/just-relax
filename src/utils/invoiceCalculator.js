import { PRICING_CONFIG, TAX_CONFIG } from "../config/pricing.js";

export function inferTaxSlab(input = {}) {
  if (input.taxSlab === "higher" || input.taxSlab === "standard") return input.taxSlab;
  const state = TAX_CONFIG[input.state] ? input.state : "Delhi";
  const igst = Number(input.igstRate ?? input.igst);
  const cgst = Number(input.cgstRate ?? input.cgst);
  const sgst = Number(input.sgstRate ?? input.sgst);
  if (state === "Delhi" && igst === TAX_CONFIG.Delhi.higher.igst) return "higher";
  if (state === "Haryana" && (cgst === TAX_CONFIG.Haryana.higher.cgst || sgst === TAX_CONFIG.Haryana.higher.sgst)) return "higher";
  return PRICING_CONFIG.defaultTaxSlab;
}

export function parseCurrency(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

export function formatIndianCurrency(value) {
  return Math.round(parseCurrency(value)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function threeDigitWords(value) {
  let number = value;
  const words = [];
  if (number >= 100) {
    words.push(`${ones[Math.floor(number / 100)]} Hundred`);
    number %= 100;
  }
  if (number >= 20) {
    words.push(tens[Math.floor(number / 10)]);
    if (number % 10) words.push(ones[number % 10]);
  } else if (number) {
    words.push(ones[number]);
  }
  return words.join(" ");
}

export function amountInIndianWords(value) {
  let number = Math.max(0, Math.round(parseCurrency(value)));
  if (number === 0) return "Rupees Zero Only.";
  const words = [];
  for (const [size, label] of [[10_000_000, "Crore"], [100_000, "Lakh"], [1_000, "Thousand"]]) {
    if (number >= size) {
      words.push(`${threeDigitWords(Math.floor(number / size))} ${label}`);
      number %= size;
    }
  }
  if (number) words.push(threeDigitWords(number));
  return `Rupees ${words.join(" ")} Only.`;
}

export function calculateInvoice(input) {
  const state = TAX_CONFIG[input.state] ? input.state : "Delhi";
  const taxSlab = inferTaxSlab({ ...input, state });
  const rates = TAX_CONFIG[state][taxSlab];
  const invoiceTotalInput = parseCurrency(input.invoiceTotal);
  const discountInput = parseCurrency(input.discount);
  const compensationCessInput = parseCurrency(input.compensationCess);
  const otherChargesInput = parseCurrency(input.otherCharges);

  const invoiceTotal = Math.max(0, Math.round(invoiceTotalInput));
  const discount = Math.max(0, Math.round(discountInput));
  const compensationCess = Math.max(0, Math.round(compensationCessInput));
  const otherCharges = Math.max(0, Math.round(otherChargesInput));
  const combinedGstRate = rates.igst || rates.cgst + rates.sgst;
  const priceOfOne = Math.round(invoiceTotal / (1 + combinedGstRate / 100));
  const netSellingPrice = Math.round(priceOfOne - discount);

  let igstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  if (state === "Delhi") {
    igstAmount = Math.round(invoiceTotal - netSellingPrice);
  } else {
    cgstAmount = Math.round(netSellingPrice * rates.cgst / 100);
    sgstAmount = Math.round(netSellingPrice * rates.sgst / 100);
  }
  const totalGst = igstAmount + cgstAmount + sgstAmount;
  const tcs = input.applyTcs ? Math.round(invoiceTotal * PRICING_CONFIG.tcsRate / 100) : 0;
  const grandTotal = invoiceTotal + tcs;

  return {
    state,
    taxSlab,
    invoiceTotal,
    priceOfOne,
    discount,
    compensationCess,
    otherCharges,
    netSellingPrice,
    igst: rates.igst,
    igstRate: rates.igst,
    igstAmount,
    cgst: rates.cgst,
    cgstRate: rates.cgst,
    cgstAmount,
    sgst: rates.sgst,
    sgstRate: rates.sgst,
    sgstAmount,
    totalGst,
    total: invoiceTotal,
    tcs,
    grandTotal,
    amountInWords: amountInIndianWords(grandTotal),
    invoiceTotalIsValid: invoiceTotalInput >= 0,
    discountIsValid: discount <= priceOfOne,
    compensationCessIsValid: compensationCessInput >= 0,
    otherChargesIsValid: otherChargesInput >= 0,
  };
}
