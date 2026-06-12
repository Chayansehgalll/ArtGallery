import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { getToken, clearToken } from "./api";

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
    setReady(true);
    document.body.style.cursor = "auto";
    return () => { document.body.style.cursor = ""; };
  }, []);

  if (!ready) return <div className="min-h-screen bg-black" />;

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        clearToken();
        setAuthed(false);
      }}
    />
  );
}
