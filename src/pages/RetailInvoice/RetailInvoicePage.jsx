import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Edit3, Printer, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import InvoicePreviewLive from "./InvoicePreviewLive";
import { defaultInvoice } from "./invoiceFields";
import PricingCalculatorSync from "./PricingCalculatorSync";

export default function RetailInvoicePage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(!mode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, setValue, getValues, control } = useForm({ defaultValues: defaultInvoice });

  const loadInvoices = useCallback(async () => {
    try { setLoading(true); setInvoices((await api.get("/invoices")).data); }
    catch { setMessage("Could not load invoices. Check the server configuration."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (!mode) loadInvoices(); }, [mode, loadInvoices]);
  useEffect(() => {
    if (mode === "new" && !id) reset({ ...defaultInvoice });
  }, [mode, id, reset]);
  useEffect(() => {
    if (id) api.get(`/invoices/${id}`).then(({ data: invoice }) => reset({
      ...defaultInvoice,
      ...invoice,
      dealerName: invoice.dealerName || defaultInvoice.dealerName,
      dealerGst: invoice.dealerGst || defaultInvoice.dealerGst,
    })).catch(() => setMessage("Invoice could not be loaded."));
  }, [id, reset]);

  const setExportScale = useCallback((paper) => {
    if (!paper) return;
    const content = paper.querySelector(".invoice-content");
    const topMargin = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--invoice-top-margin")) || 60;
    const pixelsPerMm = paper.getBoundingClientRect().width / 210;
    const availableHeight = (297 - topMargin - 12) * pixelsPerMm;
    const targetHeight = availableHeight * 0.93;
    const scale = Math.min(1.07, Math.max(0.9, targetHeight / content.scrollHeight));
    paper.style.setProperty("--invoice-export-scale", scale.toFixed(4));
  }, []);

  useEffect(() => {
    const preparePrint = () => setExportScale(previewRef.current);
    const cleanupPrint = () => previewRef.current?.style.removeProperty("--invoice-export-scale");
    window.addEventListener("beforeprint", preparePrint);
    window.addEventListener("afterprint", cleanupPrint);
    return () => {
      window.removeEventListener("beforeprint", preparePrint);
      window.removeEventListener("afterprint", cleanupPrint);
    };
  }, [setExportScale]);

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
  const remove = useCallback(async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) return;
    try { await api.delete(`/invoices/${invoice.id}`); loadInvoices(); }
    catch { setMessage("Invoice could not be deleted."); }
  }, [loadInvoices]);
  const downloadPdf = useCallback(async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const paper = previewRef.current;
    paper.classList.add("pdf-export");
    setExportScale(paper);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = await html2canvas(paper, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`${getValues("invoiceNumber") || "invoice"}.pdf`);
    } finally {
      paper.classList.remove("pdf-export");
      paper.style.removeProperty("--invoice-export-scale");
    }
  }, [getValues, setExportScale]);
  if (!mode) return <InvoiceList invoices={invoices} loading={loading} search={search} onSearch={setSearch} onDelete={remove} />;
  const viewing = mode === "view";
  return (
    <div className="invoice-workspace">
      <div className="no-print sticky top-16 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-7">
        <Link to="/invoices" className="icon-button"><ArrowLeft size={18} /></Link>
        <div className="mr-auto"><h1 className="font-bold text-navy">{viewing ? "Invoice details" : mode === "edit" ? "Edit invoice" : "New retail invoice"}</h1><p className="text-xs text-slate-400">{viewing ? "Saved retail invoice" : "Complete the fields and review the live preview"}</p></div>
        {message && <span className="text-sm text-red-600">{message}</span>}
        {viewing && <Link to={`/invoices/${id}/edit`} className="secondary-button"><Edit3 size={16}/> Edit</Link>}
        <button onClick={() => window.print()} className="secondary-button"><Printer size={16}/> Print</button>
        <button onClick={downloadPdf} className="secondary-button"><Download size={16}/> PDF</button>
        {!viewing && <button onClick={handleSubmit(save)} disabled={saving} className="primary-button"><Save size={16}/>{saving ? "Saving…" : "Save invoice"}</button>}
      </div>
      <PricingCalculatorSync control={control} setValue={setValue} />
      <div className="invoice-editor-grid grid min-w-0 items-start gap-[clamp(1rem,1.6vw,1.5rem)] p-[clamp(1rem,1.8vw,1.75rem)] min-[1180px]:grid-cols-[minmax(320px,38%)_minmax(0,62%)]">
        <div className="invoice-form-panel min-w-0"><InvoiceForm register={register} control={control} disabled={viewing} getValues={getValues} /></div>
        <div className="invoice-preview-host min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-[clamp(.5rem,1.2vw,1rem)] min-[1180px]:sticky min-[1180px]:top-36"><InvoicePreviewLive ref={previewRef} control={control} /></div>
      </div>
    </div>
  );
}
