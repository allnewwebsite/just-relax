import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Edit3, Printer, Save, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import DateField from "../../components/DateField";
import { getDefaultReceiptValues } from "../../utils/date";
import { amountInIndianWords, formatIndianCurrency, parseCurrency } from "../../utils/invoiceCalculator";
import MarginMoneyPreview from "./MarginMoneyPreview";

const createDefaults = () => getDefaultReceiptValues();

export default function MarginMoneyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [record, setRecord] = useState(createDefaults());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { register, control, reset, handleSubmit, getValues } = useForm({ defaultValues: createDefaults() });
  const amountRegistration = register("amount");
  const watchedValues = useWatch({ control });
  const watchedAmount = watchedValues.amount;
  const amount = useMemo(() => Math.max(0, Math.round(parseCurrency(watchedAmount))), [watchedAmount]);
  const receiptData = useMemo(() => ({ ...record, ...watchedValues, amount, amountInWords: amountInIndianWords(amount) }), [amount, record, watchedValues]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      try { data = (await api.get(`/invoices/${id}/margin-money`)).data; }
      catch (error) {
        if (error.response?.status !== 404) throw error;
        data = (await api.post(`/invoices/${id}/margin-money`)).data;
      }
      const next = { ...createDefaults(), ...data, amount: Number(data.amount) || 0 };
      setRecord(next); reset(next); setEditing(next.amount === 0 && !next.receiptDate);
    } catch (error) { setMessage(error.response?.data?.message || "Receipt could not be loaded."); }
    finally { setLoading(false); }
  }, [id, reset]);
  useEffect(() => { load(); }, [load]);

  const save = async (values) => {
    try {
      setSaving(true); setMessage("");
      const normalizedValues = {
        ...values,
        receiptDate: values.receiptDate || getDefaultReceiptValues().receiptDate,
        transactionDate: values.transactionDate || getDefaultReceiptValues().transactionDate,
        drawnOn: values.drawnOn || "Axis Bank Ltd",
        onAccountOf: values.onAccountOf || "Balance payment",
        amount: Math.max(0, Math.round(parseCurrency(values.amount))),
      };
      const data = (await api.put(`/invoices/${id}/margin-money`, normalizedValues)).data;
      const next = { ...createDefaults(), ...data, amount: Number(data.amount) || 0 };
      setRecord(next); reset(next); setEditing(false);
    } catch (error) { setMessage(error.response?.data?.message || "Receipt could not be saved."); }
    finally { setSaving(false); }
  };
  const downloadPdf = useCallback(async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const paper = previewRef.current;
    paper.classList.add("receipt-pdf-export");
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = await html2canvas(paper, { scale: 2, backgroundColor: "#ffffff", logging: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`${receiptData.receiptNumber || "payment-receipt"}.pdf`);
    } finally { paper.classList.remove("receipt-pdf-export"); }
  }, [receiptData.receiptNumber]);
  if (loading) return <div className="grid min-h-[calc(100vh-4rem)] place-items-center"><span className="loader" /></div>;
  return <div className="receipt-workspace">
    <div className="no-print sticky top-16 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-7">
      <Link to={`/invoices/${id}`} className="icon-button"><ArrowLeft size={18} /></Link>
      <div className="mr-auto"><h1 className="font-bold text-navy">Margin Money / Payment Receipt</h1><p className="text-xs text-slate-400">Linked to invoice {id}</p></div>
      {message && <span className="text-sm text-red-600">{message}</span>}
      {!editing && <button type="button" className="secondary-button" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit</button>}
      <button type="button" className="secondary-button" onClick={() => window.print()}><Printer size={16} /> Print</button>
      <button type="button" className="secondary-button" onClick={downloadPdf}><Download size={16} /> PDF</button>
      {editing && <button type="button" className="secondary-button" onClick={() => { reset(record); setEditing(false); }}><X size={16} /> Cancel</button>}
      {editing && <button type="button" className="primary-button" onClick={handleSubmit(save)} disabled={saving}><Save size={16} />{saving ? "Saving..." : "Save receipt"}</button>}
    </div>
    <div className="receipt-editor-grid grid min-w-0 items-start gap-6 p-[clamp(1rem,1.8vw,1.75rem)] min-[1180px]:grid-cols-[minmax(320px,38%)_minmax(0,62%)]">
      <form className="receipt-form-panel min-w-0 space-y-4" onSubmit={handleSubmit(save)}>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 font-bold text-navy">Invoice information</h2><div className="grid gap-4 sm:grid-cols-2">
          {[['dealerGst','GST No.'],['customerId','Customer ID'],['customerName','Customer Name'],['customerAddress','Customer Address'],['model','Model'],['variant','Vehicle Variant'],['hypothecation','Hypothecation'],['dealerName','Dealer / Company']].map(([name,label]) => <div key={name} className={name === 'customerAddress' ? 'sm:col-span-2' : ''}><label className="field-label">{label}</label><textarea readOnly={name !== 'dealerGst'} disabled={name === 'dealerGst' ? !editing : undefined} rows={name === 'customerAddress' ? 2 : 1} className={`field-input ${name === 'dealerGst' ? '' : 'bg-slate-50'}`} {...(name === 'dealerGst' ? register(name) : {})} value={name === 'dealerGst' ? undefined : record[name] || ""} /></div>)}
        </div></section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 font-bold text-navy">Payment information</h2><div className="grid gap-4 sm:grid-cols-2">
          <div><label className="field-label">Receipt Number</label><input readOnly className="field-input bg-slate-50" value={record.receiptNumber} /></div>
          <div><label className="field-label">Receipt Date</label><Controller name="receiptDate" control={control} render={({ field }) => <DateField field={field} disabled={!editing} />} /></div>
          <div><label className="field-label">Payment Mode</label><select disabled={!editing} className="field-input" {...register("paymentMode")}><option value="">Select payment mode</option><option>Cash</option><option>RTGS/NEFT/IMPS</option><option>Cheque</option><option>Other</option></select></div>
          <div><label className="field-label">Cheque/Transaction No.</label><input disabled={!editing} className="field-input" {...register("transactionNumber")} /></div>
          <div><label className="field-label">Cheque / Trans. Date</label><Controller name="transactionDate" control={control} render={({ field }) => <DateField field={field} disabled={!editing} />} /></div>
          <div><label className="field-label">Drawn On</label><input disabled={!editing} className="field-input" {...register("drawnOn")} /></div>
          <div><label className="field-label">Margin Money / Total Deposit</label><input disabled={!editing} className="field-input" inputMode="numeric" value={formatIndianCurrency(watchedAmount || 0)} {...amountRegistration} onChange={(event) => { event.target.value = event.target.value.replace(/\D/g, ""); amountRegistration.onChange(event); }} /></div>
          <div><label className="field-label">On Account Of</label><input disabled={!editing} className="field-input" {...register("onAccountOf")} /></div>
        </div></section>
      </form>
      <div className="receipt-preview-host min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-[clamp(.5rem,1.2vw,1rem)] min-[1180px]:sticky min-[1180px]:top-36"><MarginMoneyPreview ref={previewRef} data={receiptData} /></div>
    </div>
  </div>;
}
