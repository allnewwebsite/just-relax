import { memo, useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { calculateInvoice, formatIndianCurrency } from "../../utils/invoiceCalculator";

const moneyFields = ["priceOfOne", "netSellingPrice", "igstAmount", "cgstAmount", "sgstAmount", "totalGst", "total", "tcs", "grandTotal"];

function PricingCalculatorSync({ control, setValue }) {
  const [state, taxSlab, invoiceTotal, discount, compensationCess, otherCharges, applyTcs] = useWatch({
    control,
    name: ["state", "taxSlab", "invoiceTotal", "discount", "compensationCess", "otherCharges", "applyTcs"],
  });
  const calculation = useMemo(() => calculateInvoice({
    state, taxSlab, invoiceTotal, discount, compensationCess, otherCharges, applyTcs,
  }), [state, taxSlab, invoiceTotal, discount, compensationCess, otherCharges, applyTcs]);

  useEffect(() => {
    setValue("igst", String(calculation.igst));
    setValue("igstRate", String(calculation.igstRate));
    setValue("cgst", String(calculation.cgst));
    setValue("cgstRate", String(calculation.cgstRate));
    setValue("sgst", String(calculation.sgst));
    setValue("sgstRate", String(calculation.sgstRate));
    moneyFields.forEach((field) => setValue(field, formatIndianCurrency(calculation[field])));
    setValue("amountInWords", calculation.amountInWords);
  }, [calculation, setValue]);
  return null;
}

export default memo(PricingCalculatorSync);
