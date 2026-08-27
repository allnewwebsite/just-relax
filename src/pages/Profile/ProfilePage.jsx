import { CalendarDays, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatDateDDMMYYYY } from "../../utils/date";

const formatDate = (value) => value ? formatDateDDMMYYYY(value) : "Not available";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const providerId = user?.providerData?.[0]?.providerId;
  const provider = providerId === "password" ? "Email and Password" : providerId || "Not available";
  const initial = (profile?.displayName || user?.email || "U").trim().charAt(0).toUpperCase();
  const details = [
    { icon: Mail, label: "User Email", value: user?.email || "Not available" },
    { icon: KeyRound, label: "Authentication Provider", value: provider },
    { icon: CalendarDays, label: "Account Created", value: formatDate(user?.metadata?.creationTime) },
    { icon: ShieldCheck, label: "Last Login", value: formatDate(user?.metadata?.lastSignInTime) },
  ];
  return (
    <div className="mx-auto w-full max-w-5xl p-[clamp(1rem,2.2vw,2rem)]">
      <div className="mb-6"><p className="eyebrow">Account</p><h1 className="page-title">Profile</h1><p className="page-subtitle">Your account and authentication information.</p></div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-white p-[clamp(1.25rem,3vw,2rem)]">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-700 text-xl font-bold text-white shadow-sm">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : initial}
          </div>
          <div className="min-w-0"><h2 className="truncate text-lg font-bold text-navy">{profile?.displayName || "Just Relax User"}</h2><p className="truncate text-sm text-slate-500">{user?.email}</p><span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">{profile?.role || "User"}</span></div>
        </div>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
          {details.map(({ icon: Icon, label, value }) => <div key={label} className="flex min-w-0 gap-3 bg-white p-[clamp(1rem,2.2vw,1.5rem)]">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500"><Icon size={17} /></div>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-700">{value}</p></div>
          </div>)}
        </div>
      </section>
    </div>
  );
}
