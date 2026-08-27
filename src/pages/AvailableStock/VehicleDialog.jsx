import { memo, useEffect } from "react";
import { CarFront, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { emptyVehicle, HYUNDAI_MODELS, LOCATIONS, PDI_STATUSES } from "./stockConfig";
import { formatDateDDMMYYYY, normalizeDateInput } from "../../utils/date";

const fieldClass = "field-input";
const required = (label) => ({ required: `${label} is required` });

function VehicleDialog({ mode, vehicle, open, saving, serverError, onClose, onSave }) {
  const readOnly = mode === "view";
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: emptyVehicle });
  useEffect(() => {
    if (open) reset(vehicle ? { ...emptyVehicle, ...vehicle } : emptyVehicle);
  }, [open, vehicle, reset]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  const input = (name, label, options = {}) => <div>
    <label className="field-label">{label}{options.required !== false && <span className="ml-1 text-red-500">*</span>}</label>
    {options.type === "date" ? <Controller name={name} control={control} rules={options.required === false ? {} : required(label)} render={({ field }) => <input disabled={readOnly} type="text" inputMode="numeric" className={fieldClass} placeholder={readOnly ? "" : "DD-MM-YYYY"} value={formatDateDDMMYYYY(field.value)} onChange={(event) => field.onChange(normalizeDateInput(event.target.value))} onBlur={field.onBlur} ref={field.ref} />} /> : <input disabled={readOnly} type="text" className={fieldClass} placeholder={readOnly ? "" : options.placeholder || `Enter ${label.toLowerCase()}`} {...register(name, options.required === false ? {} : required(label))} />}
    {errors[name] && <p className="field-error">{errors[name].message}</p>}
  </div>;
  const select = (name, label, options) => <div>
    <label className="field-label">{label}<span className="ml-1 text-red-500">*</span></label>
    <select disabled={readOnly} className={fieldClass} {...register(name, required(label))}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
    {errors[name] && <p className="field-error">{errors[name].message}</p>}
  </div>;
  return <div className="dialog-backdrop overflow-y-auto py-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="vehicle-dialog-title">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700"><CarFront size={18}/></div>
        <div><h2 id="vehicle-dialog-title" className="font-bold text-navy">{mode === "view" ? "Vehicle details" : mode === "edit" ? "Edit vehicle" : "Add vehicle"}</h2><p className="text-xs text-slate-400">{readOnly ? "Available stock record" : "Enter the vehicle stock information."}</p></div>
        <button type="button" onClick={onClose} className="icon-button ml-auto border-transparent"><X size={19}/></button>
      </header>
      <form onSubmit={handleSubmit(onSave)}>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {select("location", "Location", LOCATIONS)}
          {input("registerNumber", "Register Number", { placeholder: "HR26AB1234" })}
          {select("carModel", "Car Model", HYUNDAI_MODELS)}
          {input("vinNumber", "VIN Number")}
          {input("engineNumber", "Engine Number")}
          {input("keyNumber", "Key Number")}
          {input("color", "Color", { placeholder: "White, Black, Silver…" })}
          {input("variant", "Variant", { placeholder: "SX, SX(O), Sportz…" })}
          {input("vehicleAge", "Vehicle Age", { type: "date" })}
          {select("pdiStatus", "PDI Status", PDI_STATUSES)}
          {input("holdBy", "Hold By", { required: false, placeholder: "Customer or sales executive" })}
          <div className="sm:col-span-2"><label className="field-label">Remarks</label><textarea disabled={readOnly} rows="3" className={`${fieldClass} resize-none`} placeholder={readOnly ? "" : "Optional remarks"} {...register("remarks")} /></div>
        </div>
        {serverError && <p className="mx-5 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:mx-6">{serverError}</p>}
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="secondary-button">{readOnly ? "Close" : "Cancel"}</button>
          {!readOnly && <button disabled={saving} className="primary-button">{saving ? "Saving…" : "Save Vehicle"}</button>}
        </footer>
      </form>
    </section>
  </div>;
}
export default memo(VehicleDialog);
