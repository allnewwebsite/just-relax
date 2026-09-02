import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const RetailInvoicePage = lazy(() => import("./pages/RetailInvoice/RetailInvoicePage"));
const UserManagementPage = lazy(() => import("./pages/Users/UserManagementPage"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const AvailableStockPage = lazy(() => import("./pages/AvailableStock/AvailableStockPage"));
const MarginMoneyPage = lazy(() => import("./pages/MarginMoney/MarginMoneyPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><span className="loader" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/invoices" element={<RetailInvoicePage />} />
            <Route path="/invoices/new" element={<RetailInvoicePage mode="new" />} />
            <Route path="/invoices/:id/margin-money" element={<MarginMoneyPage />} />
            <Route path="/invoices/:id" element={<RetailInvoicePage mode="view" />} />
            <Route path="/invoices/:id/edit" element={<RetailInvoicePage mode="edit" />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/available-stock" element={<AvailableStockPage />} />
            <Route path="/" element={<Navigate to="/invoices" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
