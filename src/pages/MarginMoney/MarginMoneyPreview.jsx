import { forwardRef, memo } from "react";
import { formatDateDDMMYYYY } from "../../utils/date";
import { formatIndianCurrency } from "../../utils/invoiceCalculator";

const value = (text) => text || "\u00a0";
const money = (amount) => formatIndianCurrency(amount || 0);

const MarginMoneyPreview = memo(forwardRef(function MarginMoneyPreview({ data }, ref) {
  return <div ref={ref} className="receipt-paper">
    <div className="receipt-content">
      <h1 className="receipt-title">Receipt</h1>
      <div className="receipt-meta">
        <div><span>GST No.</span><strong>: {value(data.dealerGst)}</strong></div><div><span>Date</span><strong>: {value(formatDateDDMMYYYY(data.receiptDate))}</strong></div>
        <div><span>Receipt No.</span><strong>: {value(data.receiptNumber)}</strong></div><div><span>Customer Id</span><strong>: {value(data.customerId)}</strong></div>
      </div>
      <div className="receipt-lines">
        <div><span>Received with</span><strong>: {value(data.customerName)}</strong></div>
        <div><span>Thanks from</span><strong>: {value(data.customerAddress)}</strong></div>
        <div><span>Model</span><strong>: {value([data.model, data.variant].filter(Boolean).join(" / "))}</strong></div>
        <div><span>Hypothecation</span><strong>: {value(data.hypothecation)}</strong></div>
        <div><span>by</span><strong>: {value(data.paymentMode)}</strong></div>
        <div><span>Cheque/Transaction No.</span><strong>: {value(data.transactionNumber)}</strong></div>
        <div><span>Cheque/Trans. Date</span><strong>: {value(formatDateDDMMYYYY(data.transactionDate))}</strong></div>
        <div><span>Drawn on</span><strong>: {value(data.drawnOn)}</strong></div>
        <div><span>a sum of</span><strong>: {value(data.amountInWords)}</strong></div>
        <div><span>on Account of</span><strong>: {value(data.onAccountOf)}</strong></div>
      </div>
      <div className="receipt-total"><span>Total Deposit Rs:</span><strong>{money(data.amount)}</strong></div>
      <div className="receipt-notes"><p>Note:</p><p>1. Subject to realisation of cheque</p><p>2. Price prevailing on the date of delivery will apply.</p><p>3. Please note that cancellation of booking from the customer shall be subject to cancellation charges of Rs. 500/- which shall be borne by the customer only, effective from 1st February 2025.</p></div>
      <div className="receipt-signature"><p>For {value(data.dealerName)}</p><div>____________________________</div><span>Authorised</span></div>
    </div>
  </div>;
}));

export default MarginMoneyPreview;
