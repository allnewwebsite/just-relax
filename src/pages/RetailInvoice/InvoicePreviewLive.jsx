import { forwardRef, memo, useDeferredValue } from "react";
import { useWatch } from "react-hook-form";
import InvoicePreview from "./InvoicePreview";

const InvoicePreviewLive = memo(forwardRef(function InvoicePreviewLive({ control }, ref) {
  const liveData = useWatch({ control });
  const deferredData = useDeferredValue(liveData);
  return <InvoicePreview ref={ref} data={deferredData} />;
}));

export default InvoicePreviewLive;
