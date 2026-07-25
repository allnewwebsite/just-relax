import { memo, useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { calculateInvoice, formatIndianCurrency } from "../../utils/invoiceCalculator";

const moneyFields = ["priceOfOne", "netSellingPrice", "igstAmount", "cgstAmount", "sgstAmount", "totalGst", "total", "tcs", "grandTotal"];

function PricingCalculatorSync({ control, setValue }) {
  const [state, invoiceTotal, discount, compensationCess, otherCharges, applyTcs] = useWatch({
    control,
    name: ["state", "invoiceTotal", "discount", "compensationCess", "otherCharges", "applyTcs"],
  });
  const calculation = useMemo(() => calculateInvoice({
    state, invoiceTotal, discount, compensationCess, otherCharges, applyTcs,
  }), [state, invoiceTotal, discount, compensationCess, otherCharges, applyTcs]);

  useEffect(() => {
    setValue("igst", String(calculation.igst));
    setValue("cgst", String(calculation.cgst));
    setValue("sgst", String(calculation.sgst));
    moneyFields.forEach((field) => setValue(field, formatIndianCurrency(calculation[field])));
    setValue("amountInWords", calculation.amountInWords);
  }, [calculation, setValue]);
  return null;
}

export default memo(PricingCalculatorSync);
