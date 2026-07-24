import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function InvoiceList({ invoices, loading, search, onSearch, onDelete }) {
  const filtered = invoices.filter((i) => [i.invoiceNumber, i.customerName, i.panNumber].some((v) => (v || "").toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Retail invoice</p><h1 className="page-title">Invoices</h1><p className="page-subtitle">Create and manage your retail invoices.</p></div>
        <Link to="/invoices/new" className="primary-button"><Plus size={17} /> Create invoice</Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 p-4"><div className="relative max-w-md"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => onSearch(e.target.value)} className="field-input pl-10" placeholder="Search invoice, customer, or PAN…" /></div></div>
        <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Invoice Number</th><th>Customer Name</th><th>Invoice Date</th><th>PAN Number</th><th>Created Date</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="6" className="py-16 text-center text-slate-400">Loading invoices…</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="py-16 text-center"><p className="font-semibold text-slate-600">{search ? "No matching invoices" : "No invoices yet"}</p><p className="mt-1 text-sm text-slate-400">{search ? "Try another search term." : "Create your first invoice to get started."}</p></td></tr> : filtered.map((item) => <tr key={item.id}><td className="font-semibold text-blue-700">{item.invoiceNumber}</td><td>{item.customerName}</td><td>{item.invoiceDate}</td><td>{item.panNumber}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td><td><div className="flex justify-end gap-1"><Link className="table-action" to={`/invoices/${item.id}`} title="View"><Eye size={16}/></Link><Link className="table-action" to={`/invoices/${item.id}/edit`} title="Edit"><Edit3 size={16}/></Link><button className="table-action hover:text-red-600" onClick={() => onDelete(item)} title="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
  );
}
