import { memo, useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDateDDMMYYYY } from "../../utils/date";

const InvoiceRow = memo(function InvoiceRow({ item, onDelete, style }) {
  const deleteInvoice = useCallback(() => onDelete(item), [item, onDelete]);
  return <div className="invoice-list-grid invoice-list-row" style={style}>
    <div className="font-semibold text-blue-700">{item.invoiceNumber}</div>
    <div>{item.customerName}</div>
    <div>{formatDateDDMMYYYY(item.invoiceDate)}</div>
    <div>{item.panNumber}</div>
    <div>{formatDateDDMMYYYY(item.createdAt) || ""}</div>
    <div className="flex justify-end gap-1"><Link className="table-action" to={`/invoices/${item.id}`} title="View"><Eye size={16}/></Link><Link className="table-action" to={`/invoices/${item.id}/edit`} title="Edit"><Edit3 size={16}/></Link><button className="table-action hover:text-red-600" onClick={deleteInvoice} title="Delete"><Trash2 size={16}/></button></div>
  </div>;
});

export default function InvoiceList({ invoices, loading, search, onSearch, onDelete }) {
  const scrollRef = useRef(null);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) => [invoice.invoiceNumber, invoice.customerName, invoice.panNumber]
      .some((value) => (value || "").toLowerCase().includes(query)));
  }, [invoices, search]);
  const virtualized = filtered.length > 80;
  const rowVirtualizer = useVirtualizer({
    count: virtualized ? filtered.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 65,
    overscan: 8,
  });
  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Retail invoice</p><h1 className="page-title">Invoices</h1><p className="page-subtitle">Create and manage your retail invoices.</p></div>
        <Link to="/invoices/new" className="primary-button"><Plus size={17} /> Create invoice</Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 p-4"><div className="relative max-w-md"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => onSearch(e.target.value)} className="field-input pl-10" placeholder="Search invoice, customer, or PAN…" /></div></div>
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            <div className="invoice-list-grid invoice-list-head"><div>Invoice Number</div><div>Customer Name</div><div>Invoice Date</div><div>PAN Number</div><div>Created Date</div><div className="text-right">Actions</div></div>
            {loading ? <div className="py-16 text-center text-sm text-slate-400">Loading invoices…</div> : filtered.length === 0 ? <div className="py-16 text-center"><p className="font-semibold text-slate-600">{search ? "No matching invoices" : "No invoices yet"}</p><p className="mt-1 text-sm text-slate-400">{search ? "Try another search term." : "Create your first invoice to get started."}</p></div> : virtualized ? (
              <div ref={scrollRef} className="max-h-[620px] overflow-y-auto">
                <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => <InvoiceRow key={filtered[virtualRow.index].id} item={filtered[virtualRow.index]} onDelete={onDelete} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }} />)}
                </div>
              </div>
            ) : filtered.map((item) => <InvoiceRow key={item.id} item={item} onDelete={onDelete} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
