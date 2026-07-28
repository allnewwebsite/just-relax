import { useCallback, useEffect, useMemo, useState } from "react";
import { CarFront, Plus, Trash2 } from "lucide-react";
import VehicleDialog from "./VehicleDialog";
import { MODEL_TAB_ORDER } from "./stockConfig";
import ModelStockSection from "./ModelStockSection";
import StockToolbar from "./StockToolbar";
import {
  createStockVehicle, getAvailableStock, removeStockVehicle, updateStockVehicle,
} from "../../services/stockService";

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
    try { setLoading(true); setVehicles(await getAvailableStock()); }
    catch (error) { setMessage(error.response?.data?.message || "Could not load available stock."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const sortedVehicles = useMemo(() => [...vehicles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [vehicles]);
  const groupedVehicles = useMemo(() => {
    const groups = Object.fromEntries(MODEL_TAB_ORDER.map((model) => [model, []]));
    sortedVehicles.forEach((vehicle) => groups[vehicle.carModel]?.push(vehicle));
    return groups;
  }, [sortedVehicles]);
  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const displayedModels = useMemo(() => carModel ? [carModel] : MODEL_TAB_ORDER, [carModel]);
  const displayedGroups = useMemo(() => {
    if (!normalizedSearch) return Object.fromEntries(displayedModels.map((model) => [model, groupedVehicles[model]]));
    return Object.fromEntries(displayedModels.map((model) => [model, groupedVehicles[model].filter((vehicle) => [
      vehicle.registerNumber, vehicle.vinNumber, vehicle.engineNumber, vehicle.keyNumber,
      vehicle.color, vehicle.variant, vehicle.holdBy,
    ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch)))]));
  }, [displayedModels, groupedVehicles, normalizedSearch]);
  const displayedTotal = useMemo(() => displayedModels.reduce((total, model) => total + displayedGroups[model].length, 0), [displayedGroups, displayedModels]);
  const hasResults = displayedTotal > 0;

  const openDialog = useCallback((mode, vehicle = null) => {
    setDialogError("");
    setDialog({ open: true, mode, vehicle });
  }, []);
  const openAddDialog = useCallback(() => openDialog("add"), [openDialog]);
  const closeDialog = useCallback(() => setDialog((current) => ({ ...current, open: false })), []);
  const viewVehicle = useCallback((vehicle) => openDialog("view", vehicle), [openDialog]);
  const editVehicle = useCallback((vehicle) => openDialog("edit", vehicle), [openDialog]);
  const saveVehicle = useCallback(async (values) => {
    try {
      setSaving(true); setDialogError("");
      if (dialog.mode === "edit") {
        const updated = await updateStockVehicle(dialog.vehicle.id, values);
        setVehicles((current) => current.map((vehicle) => vehicle.id === updated.id ? updated : vehicle));
      } else {
        const created = await createStockVehicle(values);
        setVehicles((current) => [created, ...current]);
      }
      closeDialog();
      setCarModel(values.carModel);
      setMessage(dialog.mode === "edit" ? "Vehicle updated successfully." : "Vehicle added to available stock.");
    } catch (error) { setDialogError(error.response?.data?.message || "Could not save vehicle."); }
    finally { setSaving(false); }
  }, [dialog, closeDialog]);
  const removeVehicle = useCallback(async () => {
    try {
      const id = removeTarget.id;
      await removeStockVehicle(id);
      setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));
      setRemoveTarget(null);
      setMessage("Vehicle removed from available stock.");
    } catch (error) { setMessage(error.response?.data?.message || "Could not remove vehicle."); }
  }, [removeTarget]);

  const setDebouncedSearch = useCallback((value) => setSearch(value), []);

  return <div className="p-[clamp(1rem,2vw,1.75rem)]">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Vehicle inventory</p><h1 className="page-title">Available Stock</h1><p className="page-subtitle">Manage all available Hyundai vehicles.</p></div>
      <button onClick={openAddDialog} className="primary-button"><Plus size={17}/> Add Vehicle</button>
    </div>
    {message && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white">
      <StockToolbar total={displayedTotal} carModel={carModel} onModelChange={setCarModel} onSearchChange={setDebouncedSearch}/>
      <div className="space-y-4 bg-slate-50/60 p-4">
        {loading ? <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">Loading available stock…</div> : normalizedSearch && !hasResults ? <div className="rounded-xl border border-slate-200 bg-white py-16 text-center"><CarFront size={28} className="mx-auto mb-2 text-slate-300"/><p className="font-semibold text-slate-600">No matching vehicles</p><p className="mt-1 text-sm text-slate-400">No vehicles in the selected model match your search.</p></div> : displayedModels.map((model) => <ModelStockSection key={model} model={model} vehicles={displayedGroups[model]} onView={viewVehicle} onEdit={editVehicle} onRemove={setRemoveTarget}/>)}
      </div>
    </section>
    <VehicleDialog {...dialog} saving={saving} serverError={dialogError} onClose={closeDialog} onSave={saveVehicle}/>
    {removeTarget && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setRemoveTarget(null)}><div className="dialog-card" role="alertdialog" aria-modal="true"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><Trash2 size={18}/></div><h2 className="text-lg font-bold text-navy">Remove Vehicle</h2><p className="mt-2 text-sm text-slate-500">This vehicle will be removed from Available Stock.</p><p className="mt-2 text-xs font-semibold text-slate-700">{removeTarget.registerNumber} · {removeTarget.carModel}</p><div className="mt-6 flex justify-end gap-2"><button className="secondary-button" onClick={() => setRemoveTarget(null)}>Cancel</button><button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={removeVehicle}>Remove</button></div></div></div>}
  </div>;
}
