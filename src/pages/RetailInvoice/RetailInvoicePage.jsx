import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Edit3, Printer, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import InvoicePreview from "./InvoicePreview";
import { defaultInvoice } from "./invoiceFields";
import { calculateInvoice, formatIndianCurrency } from "../../utils/invoiceCalculator";

export default function RetailInvoicePage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(!mode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm({ defaultValues: defaultInvoice });
  const data = watch();
  const state = watch("state");
  const invoiceTotal = watch("invoiceTotal");
  const discount = watch("discount");
  const compensationCess = watch("compensationCess");
  const otherCharges = watch("otherCharges");
  const applyTcs = watch("applyTcs");

  useEffect(() => {
    const result = calculateInvoice({ state, invoiceTotal, discount, compensationCess, otherCharges, applyTcs });
    const calculatedMoneyFields = ["priceOfOne", "netSellingPrice", "igstAmount", "cgstAmount", "sgstAmount", "totalGst", "total", "tcs", "grandTotal"];
    setValue("igst", String(result.igst));
    setValue("cgst", String(result.cgst));
    setValue("sgst", String(result.sgst));
    calculatedMoneyFields.forEach((field) => setValue(field, formatIndianCurrency(result[field])));
    setValue("amountInWords", result.amountInWords);
  }, [state, invoiceTotal, discount, compensationCess, otherCharges, applyTcs, setValue]);

  const loadInvoices = useCallback(async () => {
    try { setLoading(true); setInvoices((await api.get("/invoices")).data); }
    catch { setMessage("Could not load invoices. Check the server configuration."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (!mode) loadInvoices(); }, [mode, loadInvoices]);
  useEffect(() => {
    if (id) api.get(`/invoices/${id}`).then(({ data: invoice }) => reset(invoice)).catch(() => setMessage("Invoice could not be loaded."));
  }, [id, reset]);

  const save = async (values) => {
    try {
      setSaving(true);
      if (mode === "edit") await api.put(`/invoices/${id}`, values);
      else await api.post("/invoices", values);
      navigate("/invoices");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invoice could not be saved.");
    } finally { setSaving(false); }
  };
  const remove = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) return;
    try { await api.delete(`/invoices/${invoice.id}`); loadInvoices(); }
    catch { setMessage("Invoice could not be deleted."); }
  };
  const downloadPdf = async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const width = 210; const height = canvas.height * width / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, Math.min(height, 297));
    pdf.save(`${data.invoiceNumber || "invoice"}.pdf`);
  };
  if (!mode) return <InvoiceList invoices={invoices} loading={loading} search={search} onSearch={setSearch} onDelete={remove} />;
  const viewing = mode === "view";
  return (
    <div className="invoice-workspace">
      <div className="no-print sticky top-16 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7">
        <Link to="/invoices" className="icon-button"><ArrowLeft size={18} /></Link>
        <div className="mr-auto"><h1 className="font-bold text-navy">{viewing ? "Invoice details" : mode === "edit" ? "Edit invoice" : "New retail invoice"}</h1><p className="text-xs text-slate-400">{viewing ? data.invoiceNumber || "Loading…" : "Complete the fields and review the live preview"}</p></div>
        {message && <span className="text-sm text-red-600">{message}</span>}
        {viewing && <Link to={`/invoices/${id}/edit`} className="secondary-button"><Edit3 size={16}/> Edit</Link>}
        <button onClick={() => window.print()} className="secondary-button"><Printer size={16}/> Print</button>
        <button onClick={downloadPdf} className="secondary-button"><Download size={16}/> PDF</button>
        {!viewing && <button onClick={handleSubmit(save)} disabled={saving} className="primary-button"><Save size={16}/>{saving ? "Saving…" : "Save invoice"}</button>}
      </div>
      <div className="no-print grid min-w-0 items-start gap-[clamp(1rem,1.6vw,1.5rem)] p-[clamp(1rem,1.8vw,1.75rem)] min-[1180px]:grid-cols-[minmax(320px,38%)_minmax(0,62%)]">
        <InvoiceForm register={register} errors={errors} disabled={viewing} getValues={getValues} />
        <div className="min-w-0 overflow-auto rounded-2xl border border-slate-200 bg-slate-200/60 p-[clamp(.5rem,1.2vw,1rem)] shadow-card min-[1180px]:sticky min-[1180px]:top-36"><InvoicePreview ref={previewRef} data={data} /></div>
      </div>
      <div className="print-only"><InvoicePreview data={data} /></div>
    </div>
  );
}
