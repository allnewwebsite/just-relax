import { forwardRef } from "react";
import { formatIndianCurrency } from "../../utils/invoiceCalculator";

const Value = ({ children }) => <span className="reference-value">: {children || "\u00a0"}</span>;
const vehicleText = (data) => [data.vehicleDescription, data.variant, data.colour].filter(Boolean).join(" ");
const money = (value) => value === "" || value == null ? "" : formatIndianCurrency(value);

const InvoicePreview = forwardRef(function InvoicePreview({ data }, ref) {
  return (
    <div ref={ref} className="invoice-paper" id="invoice-print">
      <h1 className="reference-title">Retail Invoice</h1>
      <div className="reference-gst">
        <div><span>Dealer GST</span><Value>{data.dealerGst}</Value></div>
        <div><span>Customer GST No.</span><Value>{data.customerGst}</Value></div>
      </div>
      <div className="reference-customer">
        <div className="reference-left">
          <div><span>Customer Name</span><Value>{data.customerName}</Value></div>
          <div className="address-row"><span>Address</span><Value>{data.customerAddress}</Value></div>
          <div><span>Financed by</span><Value>{data.financedBy}</Value></div>
        </div>
        <div className="reference-right">
          <div><span>Customer Id</span><Value>{data.customerId}</Value></div>
          <div><span>Customer PAN No.</span><Value>{data.panNumber}</Value></div>
          <div><span>Invoice No</span><Value>{data.invoiceNumber}</Value></div>
          <div><span>Invoice date</span><Value>{data.invoiceDate}</Value></div>
        </div>
      </div>
      <table className="reference-main-table">
        <thead><tr><th>PARTICULARS</th><th>AMOUNT(Rs)</th></tr></thead>
        <tbody>
          <tr><td><span>1) Price of one</span><strong>{vehicleText(data)}</strong></td><td>{money(data.priceOfOne)}</td></tr>
          <tr><td><span>2) Discount</span></td><td>{money(data.discount)}</td></tr>
          <tr><td><span>3) Net Selling Price</span></td><td>{data.netSellingPrice}</td></tr>
          {data.state === "Haryana" ? <>
            <tr><td><span>4.1) CGST</span><strong>{data.cgst}%</strong></td><td>{data.cgstAmount}</td></tr>
            <tr><td><span>4.2) SGST</span><strong>{data.sgst}%</strong></td><td>{data.sgstAmount}</td></tr>
          </> : <tr><td><span>4.1) IGST</span><strong>{data.igst}%</strong></td><td>{data.igstAmount}</td></tr>}
          <tr><td><span>4.3) Compensation Cess</span></td><td>{money(data.compensationCess)}</td></tr>
          <tr><td><span>5) Other Charges</span></td><td>{money(data.otherCharges)}</td></tr>
          <tr className="reference-spacer"><td></td><td></td></tr>
        </tbody>
        <tfoot>
          <tr><th>TOTAL</th><td>{data.total}</td></tr>
          <tr><th>TCS @1%</th><td>{data.tcs}</td></tr>
          <tr><th>GRAND TOTAL</th><td>{data.grandTotal}</td></tr>
        </tfoot>
      </table>
      <div className="amount-words">{data.amountInWords || "\u00a0"}</div>
      <p className="vehicle-heading">Vehicle Particulars</p>
      <table className="reference-vehicle-table">
        <tbody><tr>
          <td><span>Vin No.</span><strong>{data.vinNumber || "\u00a0"}</strong></td>
          <td><span>Chassis No.</span><strong>{data.chassisNumber || "\u00a0"}</strong></td>
          <td><span>Engine No.</span><strong>{data.engineNumber || "\u00a0"}</strong></td>
          <td><span>Key No.</span><strong>{data.keyNumber || "\u00a0"}</strong></td>
          <td><span>HSN No.</span><strong>{data.hsnNumber || "\u00a0"}</strong></td>
        </tr></tbody>
      </table>
      <div className="reference-for">For&nbsp;&nbsp; {data.dealerName || "\u00a0"}</div>
      <div className="reference-signatures">
        <div>
          <strong>{data.customerSignature || "\u00a0"}</strong>
          <span>Signature of Customer</span>
        </div>
        <div>
          <strong>{data.authorizedSignature || "\u00a0"}</strong>
          <span>Authorised Signatory</span>
        </div>
      </div>
    </div>
  );
});
export default InvoicePreview;
