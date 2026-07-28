import { useCallback, useEffect, useMemo, useState } from "react";
import { CarFront, Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import api from "../../services/api";
import VehicleDialog from "./VehicleDialog";
import { formatStockDate, HYUNDAI_MODELS, LOCATIONS, PDI_STATUSES } from "./stockConfig";

const emptyFilters = { location: "", carModel: "", status: "", pdiStatus: "", vehicleAge: "" };

export default function AvailableStockPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
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
        vehicle.registerNumber, vehicle.vinNumber, vehicle.engineNumber, vehicle.carModel,
        vehicle.color, vehicle.variant, vehicle.vehicleAge, formatStockDate(vehicle.vehicleAge),
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return searchable
        && (!filters.location || vehicle.location === filters.location)
        && (!filters.carModel || vehicle.carModel === filters.carModel)
        && (!filters.status || vehicle.status === filters.status)
        && (!filters.pdiStatus || vehicle.pdiStatus === filters.pdiStatus)
        && (!filters.vehicleAge || vehicle.vehicleAge === filters.vehicleAge);
    });
  }, [vehicles, search, filters]);
  const openDialog = useCallback((mode, vehicle = null) => {
    setDialogError("");
    setDialog({ open: true, mode, vehicle });
  }, []);
  const closeDialog = useCallback(() => setDialog((current) => ({ ...current, open: false })), []);
  const saveVehicle = useCallback(async (values) => {
    try {
      setSaving(true); setDialogError("");
      if (dialog.mode === "edit") await api.put(`/available-stock/${dialog.vehicle.id}`, values);
      else await api.post("/available-stock", values);
      closeDialog();
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
  const updateFilter = useCallback((event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value })), []);

  return <div className="p-[clamp(1rem,2vw,1.75rem)]">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Vehicle inventory</p><h1 className="page-title">Available Stock</h1><p className="page-subtitle">Manage all available Hyundai vehicles.</p></div>
      <button onClick={() => openDialog("add")} className="primary-button"><Plus size={17}/> Add Vehicle</button>
    </div>
    {message && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_repeat(5,minmax(130px,1fr))]">
        <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="field-input pl-10" placeholder="Search vehicle stock…"/></div>
        <select name="location" value={filters.location} onChange={updateFilter} className="field-input"><option value="">All locations</option>{LOCATIONS.map((value) => <option key={value}>{value}</option>)}</select>
        <select name="carModel" value={filters.carModel} onChange={updateFilter} className="field-input"><option value="">All models</option>{HYUNDAI_MODELS.map((value) => <option key={value}>{value}</option>)}</select>
        <select name="status" value={filters.status} onChange={updateFilter} className="field-input"><option value="">All statuses</option><option>Available</option></select>
        <select name="pdiStatus" value={filters.pdiStatus} onChange={updateFilter} className="field-input"><option value="">All PDI statuses</option>{PDI_STATUSES.map((value) => <option key={value}>{value}</option>)}</select>
        <input name="vehicleAge" value={filters.vehicleAge} onChange={updateFilter} type="date" className="field-input" title="Filter by vehicle age"/>
      </div>
      <div className="overflow-x-auto">
        <table className="stock-table"><thead><tr><th>Location</th><th>Register Number</th><th>Car Model</th><th>VIN Number</th><th>Engine Number</th><th>Key Number</th><th>Color</th><th>Variant</th><th>Vehicle Age</th><th>Hold By</th><th>PDI Status</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="13" className="py-16 text-center text-slate-400">Loading available stock…</td></tr> : filtered.length === 0 ? <tr><td colSpan="13" className="py-16 text-center"><CarFront size={28} className="mx-auto mb-2 text-slate-300"/><p className="font-semibold text-slate-600">{vehicles.length ? "No matching vehicles" : "No vehicles in available stock"}</p><p className="mt-1 text-sm text-slate-400">{vehicles.length ? "Adjust the search or filters." : "Add the first vehicle to get started."}</p></td></tr> : filtered.map((vehicle) => <tr key={vehicle.id}><td>{vehicle.location}</td><td className="font-semibold text-slate-800">{vehicle.registerNumber}</td><td>{vehicle.carModel}</td><td>{vehicle.vinNumber}</td><td>{vehicle.engineNumber}</td><td>{vehicle.keyNumber}</td><td>{vehicle.color}</td><td>{vehicle.variant}</td><td>{formatStockDate(vehicle.vehicleAge)}</td><td>{vehicle.holdBy || "—"}</td><td><span className={`stock-badge ${vehicle.pdiStatus === "Done" ? "stock-badge-blue" : "stock-badge-amber"}`}>{vehicle.pdiStatus}</span></td><td><span className="stock-badge stock-badge-green">{vehicle.status}</span></td><td><div className="flex gap-1"><button className="table-action" onClick={() => openDialog("view", vehicle)} title="View"><Eye size={16}/></button><button className="table-action" onClick={() => openDialog("edit", vehicle)} title="Edit"><Edit3 size={16}/></button><button className="table-action hover:text-red-600" onClick={() => setRemoveTarget(vehicle)} title="Remove"><Trash2 size={16}/></button></div></td></tr>)}</tbody>
        </table>
      </div>
    </section>
    <VehicleDialog {...dialog} saving={saving} serverError={dialogError} onClose={closeDialog} onSave={saveVehicle}/>
    {removeTarget && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setRemoveTarget(null)}><div className="dialog-card" role="alertdialog" aria-modal="true"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><Trash2 size={18}/></div><h2 className="text-lg font-bold text-navy">Remove Vehicle</h2><p className="mt-2 text-sm text-slate-500">This vehicle will be removed from Available Stock.</p><p className="mt-2 text-xs font-semibold text-slate-700">{removeTarget.registerNumber} · {removeTarget.carModel}</p><div className="mt-6 flex justify-end gap-2"><button className="secondary-button" onClick={() => setRemoveTarget(null)}>Cancel</button><button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={removeVehicle}>Remove</button></div></div></div>}
  </div>;
}
