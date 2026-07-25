import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const closeOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const closeWithEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmLogout(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  const openProfile = () => {
    setOpen(false);
    navigate("/profile");
  };
  const confirm = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          className="icon-button border-transparent"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open user menu"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <EllipsisVertical size={20} />
        </button>
        <div className={`header-menu ${open ? "header-menu-open" : ""}`} role="menu" aria-hidden={!open}>
          <button type="button" onClick={openProfile} className="header-menu-item" role="menuitem">
            <span className="header-menu-icon"><UserRound size={17} /></span>
            <span className="min-w-0 text-left">
              <strong>Profile</strong>
              <small>{user?.email}</small>
            </span>
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button type="button" onClick={() => { setOpen(false); setConfirmLogout(true); }} className="header-menu-item text-red-600" role="menuitem">
            <span className="header-menu-icon bg-red-50 text-red-600"><LogOut size={17} /></span>
            <strong>Logout</strong>
          </button>
        </div>
      </div>
      {confirmLogout && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setConfirmLogout(false);
        }}>
          <div className="dialog-card" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><LogOut size={19} /></div>
            <h2 id="logout-title" className="text-lg font-bold text-navy">Logout</h2>
            <p id="logout-description" className="mt-2 text-sm text-slate-500">Are you sure you want to logout?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="secondary-button" onClick={() => setConfirmLogout(false)}>Cancel</button>
              <button type="button" className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" onClick={confirm}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
