export const defaultInvoice = {
  dealerName: "DRISHTI MOTORS PVT. LTD.", dealerGst: "06AADCD9217A1Z3", customerGst: "", customerName: "", customerAddress: "", customerId: "",
  panNumber: "", invoiceNumber: "", invoiceDate: "", financedBy: "", vehicleDescription: "",
  variant: "", colour: "", state: "Delhi", invoiceTotal: "", priceOfOne: "", discount: "0", netSellingPrice: "", igst: "", igstAmount: "",
  cgst: "", cgstAmount: "", sgst: "", sgstAmount: "", totalGst: "", compensationCess: "0", otherCharges: "0",
  applyTcs: false, total: "", tcs: "", grandTotal: "", amountInWords: "", vinNumber: "",
  chassisNumber: "", engineNumber: "", keyNumber: "", hsnNumber: "",
  customerSignature: "", authorizedSignature: "",
};

export const sections = [
  { title: "Dealer & customer", fields: [
    ["dealerName", "Dealer / Company Name"], ["dealerGst", "Dealer GST"], ["customerGst", "Customer GST Number"],
    ["customerName", "Customer Name", true], ["customerAddress", "Customer Address", true, "textarea"],
    ["customerId", "Customer ID"], ["panNumber", "Customer PAN Number", true],
  ]},
  { title: "Invoice details", fields: [
    ["invoiceNumber", "Invoice Number", true], ["invoiceDate", "Invoice Date", true, "date"],
    ["financedBy", "Financed By"],
  ]},
  { title: "Vehicle details", fields: [
    ["vehicleDescription", "Vehicle Description", true], ["variant", "Variant"], ["colour", "Colour"],
  ]},
  { title: "Pricing", fields: [
    ["state", "State", true, "select"], ["invoiceTotal", "Invoice Total (Including GST)", true, "money"],
    ["discount", "Discount", false, "money"], ["compensationCess", "Compensation Cess", false, "money"],
    ["otherCharges", "Other Charges", false, "money"], ["applyTcs", "Apply TCS (1%)", false, "checkbox"],
    ["priceOfOne", "Price of One", false, "readonly"], ["netSellingPrice", "Net Selling Price", false, "readonly"],
    ["igst", "IGST %", false, "readonly"], ["igstAmount", "IGST Amount", false, "readonly"],
    ["cgst", "CGST %", false, "readonly"], ["cgstAmount", "CGST Amount", false, "readonly"],
    ["sgst", "SGST %", false, "readonly"], ["sgstAmount", "SGST Amount", false, "readonly"],
    ["totalGst", "Total GST", false, "readonly"], ["total", "Subtotal Before TCS", false, "readonly"],
    ["tcs", "TCS (1%)", false, "readonly"], ["grandTotal", "Grand Total", false, "readonly"],
    ["amountInWords", "Amount in Words", false, "readonly-textarea"],
  ]},
  { title: "Vehicle particulars", fields: [
    ["vinNumber", "VIN Number", true], ["chassisNumber", "Chassis Number", true],
    ["engineNumber", "Engine Number", true], ["keyNumber", "Key Number"], ["hsnNumber", "HSN Number"],
  ]},
  { title: "Signatures", fields: [
    ["customerSignature", "Customer Signature"], ["authorizedSignature", "Authorized Signature"],
  ]},
];
