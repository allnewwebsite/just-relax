import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/Login/LoginPage";
import RetailInvoicePage from "./pages/RetailInvoice/RetailInvoicePage";
import UserManagementPage from "./pages/Users/UserManagementPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/invoices" element={<RetailInvoicePage />} />
          <Route path="/invoices/new" element={<RetailInvoicePage mode="new" />} />
          <Route path="/invoices/:id" element={<RetailInvoicePage mode="view" />} />
          <Route path="/invoices/:id/edit" element={<RetailInvoicePage mode="edit" />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/" element={<Navigate to="/invoices" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
