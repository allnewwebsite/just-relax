import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CarFront, Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import api from "../../services/api";
import VehicleDialog from "./VehicleDialog";
import { formatStockDate, HYUNDAI_MODELS, MODEL_TAB_ORDER } from "./stockConfig";

const ModelStockSection = memo(function ModelStockSection({ model, vehicles, onView, onEdit, onRemove }) {
  return <section className="stock-model-section">
    <header className="stock-model-heading"><h2>{model}</h2><span>{vehicles.length}</span></header>
    <div className="overflow-x-auto">
      <table className="stock-table">
        <colgroup><col className="stock-col-serial"/><col className="stock-col-register"/><col className="stock-col-vin"/><col className="stock-col-engine"/><col className="stock-col-key"/><col className="stock-col-color"/><col className="stock-col-variant"/><col className="stock-col-age"/><col className="stock-col-hold"/><col className="stock-col-pdi"/><col className="stock-col-actions"/></colgroup>
        <thead><tr><th>S.No.</th><th>Register No.</th><th>VIN No.</th><th>Engine No.</th><th>Key No.</th><th>Color</th><th>Variant</th><th>Vehicle Age</th><th>Hold By</th><th>PDI Status</th><th>Actions</th></tr></thead>
        <tbody>{vehicles.length === 0 ? <tr><td colSpan="11" className="py-10 text-center text-slate-400">No {model} vehicles available.</td></tr> : vehicles.map((vehicle, index) => <tr key={vehicle.id}><td className="font-semibold tabular-nums text-slate-400">{index + 1}</td><td title={vehicle.registerNumber} className="font-semibold text-slate-800">{vehicle.registerNumber}</td><td title={vehicle.vinNumber}>{vehicle.vinNumber}</td><td title={vehicle.engineNumber}>{vehicle.engineNumber}</td><td title={vehicle.keyNumber}>{vehicle.keyNumber}</td><td title={vehicle.color}>{vehicle.color}</td><td title={vehicle.variant}>{vehicle.variant}</td><td title={formatStockDate(vehicle.vehicleAge)}>{formatStockDate(vehicle.vehicleAge)}</td><td title={vehicle.holdBy || "—"}>{vehicle.holdBy || "—"}</td><td><span className={`stock-badge ${vehicle.pdiStatus === "Done" ? "stock-badge-blue" : "stock-badge-amber"}`}>{vehicle.pdiStatus}</span></td><td><div className="flex justify-center gap-1"><button className="table-action" onClick={() => onView(vehicle)} title="View"><Eye size={16}/></button><button className="table-action" onClick={() => onEdit(vehicle)} title="Edit"><Edit3 size={16}/></button><button className="table-action hover:text-red-600" onClick={() => onRemove(vehicle)} title="Remove"><Trash2 size={16}/></button></div></td></tr>)}</tbody>
      </table>
    </div>
  </section>;
});

export default function AvailableStockPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [carModel, setCarModel] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "add", vehicle: null });
  const [removeTarget, setRemoveTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogError, setDialogError] = useState("");

  const loadVehicles = useCallback(async () => {
    try { setLoading(true); setVehicles((await api.get("/available-stock")).data); }
    catch (error) { setMessage(error.response?.data?.message || "Could not load available stock."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const searchable = [
        vehicle.registerNumber, vehicle.vinNumber, vehicle.engineNumber, vehicle.keyNumber,
        vehicle.color, vehicle.variant, vehicle.holdBy,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return searchable && (!carModel || vehicle.carModel === carModel);
    });
  }, [vehicles, search, carModel]);
  const groupedVehicles = useMemo(() => {
    const groups = Object.fromEntries(MODEL_TAB_ORDER.map((model) => [model, []]));
    filtered.forEach((vehicle) => groups[vehicle.carModel]?.push(vehicle));
    return groups;
  }, [filtered]);
  const displayedModels = useMemo(() => carModel ? [carModel] : MODEL_TAB_ORDER, [carModel]);
  const openDialog = useCallback((mode, vehicle = null) => {
    setDialogError("");
    setDialog({ open: true, mode, vehicle });
  }, []);
  const closeDialog = useCallback(() => setDialog((current) => ({ ...current, open: false })), []);
  const viewVehicle = useCallback((vehicle) => openDialog("view", vehicle), [openDialog]);
  const editVehicle = useCallback((vehicle) => openDialog("edit", vehicle), [openDialog]);
  const saveVehicle = useCallback(async (values) => {
    try {
      setSaving(true); setDialogError("");
      if (dialog.mode === "edit") await api.put(`/available-stock/${dialog.vehicle.id}`, values);
      else await api.post("/available-stock", values);
      closeDialog();
      setCarModel(values.carModel);
      setMessage(dialog.mode === "edit" ? "Vehicle updated successfully." : "Vehicle added to available stock.");
      loadVehicles();
    } catch (error) { setDialogError(error.response?.data?.message || "Could not save vehicle."); }
    finally { setSaving(false); }
  }, [dialog, closeDialog, loadVehicles]);
  const removeVehicle = useCallback(async () => {
    try {
      await api.delete(`/available-stock/${removeTarget.id}`);
      setRemoveTarget(null);
      setMessage("Vehicle removed from available stock.");
      loadVehicles();
    } catch (error) { setMessage(error.response?.data?.message || "Could not remove vehicle."); }
  }, [removeTarget, loadVehicles]);

  return <div className="p-[clamp(1rem,2vw,1.75rem)]">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Vehicle inventory</p><h1 className="page-title">Available Stock</h1><p className="page-subtitle">Manage all available Hyundai vehicles.</p></div>
      <button onClick={() => openDialog("add")} className="primary-button"><Plus size={17}/> Add Vehicle</button>
    </div>
    {message && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="mr-auto"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Vehicles</p><p className="mt-0.5 text-2xl font-bold tabular-nums text-navy">{filtered.length}</p></div>
        <div className="relative w-full sm:w-auto sm:min-w-[280px]"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="field-input pl-10" placeholder="Search vehicle…"/></div>
        <select value={carModel} onChange={(event) => setCarModel(event.target.value)} className="field-input w-full sm:w-48"><option value="">All Models</option>{HYUNDAI_MODELS.map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className="space-y-4 bg-slate-50/60 p-4">
        {loading ? <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">Loading available stock…</div> : search && filtered.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white py-16 text-center"><CarFront size={28} className="mx-auto mb-2 text-slate-300"/><p className="font-semibold text-slate-600">No matching vehicles</p><p className="mt-1 text-sm text-slate-400">No vehicles in the selected model match your search.</p></div> : displayedModels.map((model) => <ModelStockSection key={model} model={model} vehicles={groupedVehicles[model]} onView={viewVehicle} onEdit={editVehicle} onRemove={setRemoveTarget}/>)}
      </div>
    </section>
    <VehicleDialog {...dialog} saving={saving} serverError={dialogError} onClose={closeDialog} onSave={saveVehicle}/>
    {removeTarget && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setRemoveTarget(null)}><div className="dialog-card" role="alertdialog" aria-modal="true"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><Trash2 size={18}/></div><h2 className="text-lg font-bold text-navy">Remove Vehicle</h2><p className="mt-2 text-sm text-slate-500">This vehicle will be removed from Available Stock.</p><p className="mt-2 text-xs font-semibold text-slate-700">{removeTarget.registerNumber} · {removeTarget.carModel}</p><div className="mt-6 flex justify-end gap-2"><button className="secondary-button" onClick={() => setRemoveTarget(null)}>Cancel</button><button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={removeVehicle}>Remove</button></div></div></div>}
  </div>;
}
