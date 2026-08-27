import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import { formatDateDDMMYYYY, normalizeDateInput } from "../utils/date";

export default function DateField({ field, disabled, className = "field-input" }) {
  const nativePickerRef = useRef(null);
  const openPicker = () => {
    if (disabled) return;
    if (nativePickerRef.current?.showPicker) nativePickerRef.current.showPicker();
    else nativePickerRef.current?.click();
  };
  return <div className="relative">
    <input disabled={disabled} type="text" inputMode="numeric" placeholder="DD-MM-YYYY" className={`${className} pr-10`} value={formatDateDDMMYYYY(field.value)} onChange={(event) => field.onChange(normalizeDateInput(event.target.value))} onBlur={field.onBlur} ref={field.ref} />
    <button type="button" disabled={disabled} onClick={openPicker} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed" aria-label="Open date picker"><CalendarDays size={16} /></button>
    <input ref={nativePickerRef} type="date" value={String(field.value || "").slice(0, 10)} onChange={(event) => field.onChange(event.target.value)} className="date-picker-native" tabIndex="-1" aria-hidden="true" disabled={disabled} />
  </div>;
}
