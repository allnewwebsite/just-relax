import { useEffect, useState } from "react";
import { Eye, EyeOff, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [serverError, setServerError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  useEffect(() => setServerError(""), []);
  if (user) return <Navigate to="/" replace />;
  const submit = async ({ email, password }) => {
    try {
      setServerError("");
      await login(email, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch {
      setServerError("Unable to sign in. Check your email and password.");
    }
  };
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-navy p-14 text-white lg:flex lg:flex-col">
        <div className="absolute -right-36 -top-36 h-96 w-96 rounded-full border-[70px] border-blue-600/20" />
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600"><FileText /></div><span className="font-extrabold tracking-[.2em]">JUST RELAX</span></div>
        <div className="my-auto max-w-lg"><p className="mb-5 text-xs font-bold uppercase tracking-[.25em] text-blue-300">Invoice management</p><h1 className="text-5xl font-semibold leading-tight">Invoices done right.<br />Workdays made lighter.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-300">Create, organize, print, and securely manage your retail invoices from one professional workspace.</p></div>
        <p className="text-xs text-slate-500">Secure access · Powered by Firebase</p>
      </section>
      <section className="grid place-items-center p-6">
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
          <div className="mb-8 lg:hidden"><div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white"><FileText /></div><p className="font-extrabold tracking-[.18em]">JUST RELAX</p></div>
          <h2 className="text-2xl font-bold text-navy">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Sign in to manage your invoices.</p>
          <label className="field-label mt-8">Email address</label>
          <input className="field-input" type="email" placeholder="you@company.com" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
          <label className="field-label mt-5">Password</label>
          <div className="relative"><input className="field-input pr-12" type={visible ? "text" : "password"} placeholder="Enter your password" {...register("password", { required: "Password is required" })} /><button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle password">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
          {serverError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
          <button disabled={isSubmitting} className="primary-button mt-7 w-full">{isSubmitting ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
    </div>
  );
}
