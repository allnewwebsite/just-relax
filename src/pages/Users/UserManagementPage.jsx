import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserPlus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function UserManagementPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { displayName: "", email: "", password: "", role: "staff" },
  });
  const loadUsers = useCallback(async () => {
    try { setLoading(true); setUsers((await api.get("/users")).data); }
    catch (error) { setMessage(error.response?.data?.message || "Could not load users."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (profile?.role === "admin") loadUsers(); }, [profile, loadUsers]);
  if (profile && profile.role !== "admin") return <Navigate to="/invoices" replace />;

  const create = async (values) => {
    try {
      setMessage("");
      await api.post("/users", values);
      reset();
      setMessage("Employee account created.");
      loadUsers();
    } catch (error) { setMessage(error.response?.data?.message || "Could not create account."); }
  };
  const update = async (user, changes) => {
    try {
      setMessage("");
      await api.patch(`/users/${user.uid}`, { role: user.role, disabled: user.disabled, ...changes });
      loadUsers();
    } catch (error) { setMessage(error.response?.data?.message || "Could not update account."); }
  };
  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6"><p className="eyebrow">Administration</p><h1 className="page-title">User Management</h1><p className="page-subtitle">Create employee accounts and control application access.</p></div>
      {message && <div className={`mb-5 rounded-lg px-4 py-3 text-sm ${message.includes("created") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{message}</div>}
      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit(create)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-5 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserPlus size={18}/></div><div><h2 className="font-bold text-navy">Create employee</h2><p className="text-xs text-slate-400">The employee can sign in immediately.</p></div></div>
          <label className="field-label">Full name</label><input className="field-input" placeholder="Employee name" {...register("displayName", { required: "Name is required" })}/>{errors.displayName && <p className="field-error">{errors.displayName.message}</p>}
          <label className="field-label mt-4">Email address</label><input type="email" className="field-input" placeholder="employee@company.com" {...register("email", { required: "Email is required" })}/>{errors.email && <p className="field-error">{errors.email.message}</p>}
          <label className="field-label mt-4">Temporary password</label><input type="password" className="field-input" placeholder="Minimum 8 characters" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })}/>{errors.password && <p className="field-error">{errors.password.message}</p>}
          <label className="field-label mt-4">Role</label><select className="field-input" {...register("role")}><option value="staff">Staff</option><option value="admin">Admin</option></select>
          <button disabled={isSubmitting} className="primary-button mt-5 w-full"><UserPlus size={16}/>{isSubmitting ? "Creating…" : "Create account"}</button>
        </form>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5"><Users size={18} className="text-blue-700"/><h2 className="font-bold text-navy">Application users</h2><span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{users.length}</span></div>
          <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th className="text-right">Controls</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="5" className="py-14 text-center text-slate-400">Loading users…</td></tr> : users.map((user) => <tr key={user.uid}>
              <td><p className="font-semibold text-slate-800">{user.displayName || "Unnamed user"}</p><p className="text-xs text-slate-400">{user.email}</p></td>
              <td><span className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize"><ShieldCheck size={14} className={user.role === "admin" ? "text-blue-600" : "text-slate-400"}/>{user.role}</span></td>
              <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.disabled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{user.disabled ? "Disabled" : "Active"}</span></td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td><div className="flex justify-end gap-2"><select aria-label={`Role for ${user.email}`} value={user.role} onChange={(event) => update(user, { role: event.target.value })} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" disabled={user.uid === profile?.uid}><option value="staff">Staff</option><option value="admin">Admin</option></select><button onClick={() => update(user, { disabled: !user.disabled })} disabled={user.uid === profile?.uid} className="secondary-button px-2.5 py-1.5 text-xs">{user.disabled ? "Enable" : "Disable"}</button></div></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
