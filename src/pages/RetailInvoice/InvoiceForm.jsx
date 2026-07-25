import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { useFormState } from "react-hook-form";
import { sections } from "./invoiceFields";
import { calculateInvoice, formatIndianCurrency, parseCurrency } from "../../utils/invoiceCalculator";

function InvoiceForm({ register, control, disabled, getValues }) {
  const { errors } = useFormState({ control });
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <details key={section.title} open={index < 2} className="group rounded-xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-800">
            <span>{section.title}</span><ChevronDown size={18} className="transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2">
            {section.fields.map(([name, label, required, type = "text"]) => (
              <div key={name} className={type === "textarea" ? "sm:col-span-2" : ""}>
                {type !== "checkbox" && <label className="field-label">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>}
                {type === "checkbox"
                  ? <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-700"><input disabled={disabled} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500" {...register(name)} /><span>{label}</span></label>
                  : type === "select"
                  ? <select disabled={disabled} className="field-input" {...register(name, { required: `${label} is required` })}><option value="">Select state</option><option value="Delhi">Delhi</option><option value="Haryana">Haryana</option></select>
                  : type === "textarea"
                  ? <textarea disabled={disabled} rows="3" className="field-input resize-none" placeholder={`Enter ${label.toLowerCase()}`} {...register(name, { required: required && `${label} is required` })} />
                  : type === "readonly-textarea"
                  ? <textarea readOnly rows="3" className="field-input resize-none bg-slate-50" {...register(name)} />
                  : type === "readonly"
                  ? <input readOnly className="field-input bg-slate-50" {...register(name)} />
                  : (() => {
                    const registration = register(name, {
                      required: required && `${label} is required`,
                      validate: name === "invoiceTotal"
                        ? (value) => parseCurrency(value) >= 0 || "Invoice Total cannot be negative"
                        : name === "discount"
                        ? () => calculateInvoice(getValues()).discountIsValid || "Discount cannot exceed Price of One"
                        : name === "compensationCess"
                        ? (value) => parseCurrency(value) >= 0 || "Compensation Cess cannot be negative"
                        : name === "otherCharges"
                        ? (value) => parseCurrency(value) >= 0 || "Other Charges cannot be negative"
                        : undefined,
                    });
                    return <input disabled={disabled} type={type === "date" ? "date" : "text"} inputMode={type === "money" ? "numeric" : undefined} className="field-input" placeholder={type === "date" ? "" : `Enter ${label.toLowerCase()}`} {...registration} onChange={type === "money" ? (event) => {
                      const digits = event.target.value.replace(/\D/g, "");
                      event.target.value = digits ? formatIndianCurrency(digits) : "";
                      registration.onChange(event);
                    } : registration.onChange} />;
                  })()}
                {errors[name] && <p className="field-error">{errors[name].message}</p>}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default memo(InvoiceForm);
