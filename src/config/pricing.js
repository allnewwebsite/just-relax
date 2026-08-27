export const TAX_CONFIG = Object.freeze({
  Delhi: Object.freeze({
    standard: Object.freeze({ igst: 18, cgst: 0, sgst: 0 }),
    higher: Object.freeze({ igst: 40, cgst: 0, sgst: 0 }),
  }),
  Haryana: Object.freeze({
    standard: Object.freeze({ igst: 0, cgst: 9, sgst: 9 }),
    higher: Object.freeze({ igst: 0, cgst: 20, sgst: 20 }),
  }),
});

export const PRICING_CONFIG = Object.freeze({
  states: TAX_CONFIG,
  defaultTaxSlab: "standard",
  tcsRate: 1,
});
