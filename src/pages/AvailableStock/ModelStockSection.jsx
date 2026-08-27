import { memo, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { formatStockDate } from "./stockConfig";

const StockRow = memo(function StockRow({ vehicle, index, onView, onEdit, onRemove, style }) {
  const view = useCallback(() => onView(vehicle), [onView, vehicle]);
  const edit = useCallback(() => onEdit(vehicle), [onEdit, vehicle]);
  const remove = useCallback(() => onRemove(vehicle), [onRemove, vehicle]);
  return <div className="stock-register-grid stock-register-row" style={style}>
    <div className="font-semibold tabular-nums text-slate-400">{index + 1}</div>
    <div title={vehicle.registerNumber} className="font-semibold text-slate-800">{vehicle.registerNumber}</div>
    <div title={vehicle.vinNumber}>{vehicle.vinNumber}</div>
    <div title={vehicle.engineNumber}>{vehicle.engineNumber}</div>
    <div title={vehicle.keyNumber}>{vehicle.keyNumber}</div>
    <div title={vehicle.color}>{vehicle.color}</div>
    <div title={vehicle.variant}>{vehicle.variant}</div>
    <div title={formatStockDate(vehicle.vehicleAge)}>{formatStockDate(vehicle.vehicleAge)}</div>
    <div title={vehicle.holdBy || "—"}>{vehicle.holdBy || "—"}</div>
    <div><span className="stock-badge stock-badge-neutral">{vehicle.pdiStatus}</span></div>
    <div className="flex justify-center gap-1"><button className="table-action stock-action-button" onClick={view} title="View"><Eye size={16}/></button><button className="table-action stock-action-button" onClick={edit} title="Edit"><Edit3 size={16}/></button><button className="table-action stock-action-button" onClick={remove} title="Remove"><Trash2 size={16}/></button></div>
  </div>;
});

function ModelStockSection({ model, vehicles, onView, onEdit, onRemove }) {
  const scrollRef = useRef(null);
  const virtualized = vehicles.length > 50;
  const virtualizer = useVirtualizer({
    count: virtualized ? vehicles.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });
  return <section className="stock-model-section">
    <header className="stock-model-heading"><h2>{model}</h2><span>{vehicles.length}</span></header>
    <div className="overflow-x-auto">
      <div className="min-w-[1120px]">
        <div className="stock-register-grid stock-register-head"><div>S.No.</div><div>Register No.</div><div>VIN No.</div><div>Engine No.</div><div>Key No.</div><div>Color</div><div>Variant</div><div>Vehicle Age</div><div>Hold By</div><div>PDI Status</div><div>Actions</div></div>
        {vehicles.length === 0 ? <div className="py-10 text-center text-sm text-slate-400">No {model} vehicles available.</div> : virtualized ? <div ref={scrollRef} className="max-h-[560px] overflow-y-auto"><div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>{virtualizer.getVirtualItems().map((row) => <StockRow key={vehicles[row.index].id} vehicle={vehicles[row.index]} index={row.index} onView={onView} onEdit={onEdit} onRemove={onRemove} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${row.size}px`, transform: `translateY(${row.start}px)` }}/>)}</div></div> : vehicles.map((vehicle, index) => <StockRow key={vehicle.id} vehicle={vehicle} index={index} onView={onView} onEdit={onEdit} onRemove={onRemove}/>)}
      </div>
    </div>
  </section>;
}
export default memo(ModelStockSection);
