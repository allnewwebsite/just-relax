import { memo, useEffect, useState } from "react";
import { Search } from "lucide-react";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { HYUNDAI_MODELS } from "./stockConfig";

function StockToolbar({ total, carModel, onModelChange, onSearchChange }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  useEffect(() => { onSearchChange(debouncedSearch); }, [debouncedSearch, onSearchChange]);
  return <div className="stock-toolbar flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
    <div className="mr-auto"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Vehicles</p><p className="mt-0.5 text-2xl font-bold tabular-nums text-navy">{total}</p></div>
    <div className="relative w-full sm:w-auto sm:min-w-[280px]"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="field-input pl-10" placeholder="Search vehicle…"/></div>
    <select value={carModel} onChange={(event) => onModelChange(event.target.value)} className="field-input w-full sm:w-48"><option value="">All Models</option>{HYUNDAI_MODELS.map((value) => <option key={value}>{value}</option>)}</select>
  </div>;
}
export default memo(StockToolbar);
