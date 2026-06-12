import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Image as ImageIcon, ShoppingBag, BadgeIndianRupee,
  Tags, Settings, LogOut, Plus, Trash2, Edit3, X, Check, Loader2,
  TrendingUp, Users, Package, IndianRupee, RefreshCw, Eye, Upload,
} from "lucide-react";
import * as api from "./api";
import type {
  DashboardStats, AdminPainting, AdminOrder, AdminCategory, PaymentSettings,
} from "./api";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function money(v: number | string | null | undefined) {
  const n = typeof v === "string" ? parseFloat(v) : v || 0;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  const nav = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} />, end: true },
    { to: "/admin/paintings", label: "Paintings", icon: <ImageIcon size={16} /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { to: "/admin/payments", label: "Payments", icon: <BadgeIndianRupee size={16} /> },
    { to: "/admin/categories", label: "Categories", icon: <Tags size={16} /> },
    { to: "/admin/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 bg-black z-20">
        <div className="h-16 flex items-center gap-3 px-4 md:px-6 border-b border-white/5">
          <div className="w-8 h-8 border border-white/30 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-white text-sm tracking-[0.2em] uppercase font-light hidden md:block">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 md:px-6 py-3 text-xs tracking-wider uppercase transition-colors ${
                  isActive
                    ? "text-white bg-white/5 border-r-2 border-white"
                    : "text-white/40 hover:text-white/70"
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="hidden md:block">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 md:px-6 py-4 text-white/40 hover:text-red-400 text-xs tracking-wider uppercase transition-colors border-t border-white/5"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="hidden md:block">Logout</span>
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-16 md:ml-60 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-10"
        >
          <Routes>
            <Route index element={<Overview />} />
            <Route path="paintings" element={<Paintings />} />
            <Route path="orders" element={<Orders />} />
            <Route path="payments" element={<Payments />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<SettingsPanel />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
}

/* ═══════════════ OVERVIEW ═══════════════ */
function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getDashboard();
    setLoading(false);
    if (res.ok && res.data) setStats(res.data);
    else setErr(res.message || "Failed to load");
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;
  if (err) return <ErrorBox msg={err} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: "Total Revenue", value: money(stats.totalRevenue), icon: <IndianRupee size={18} /> },
    { label: "Total Orders", value: stats.totalOrders, icon: <Package size={18} /> },
    { label: "Customers", value: stats.totalCustomers, icon: <Users size={18} /> },
    { label: "Paintings", value: stats.totalPaintings, icon: <ImageIcon size={18} /> },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your gallery" action={
        <button onClick={load} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={16} /></button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border border-white/8 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/30">{c.icon}</span>
              <TrendingUp size={14} className="text-emerald-400/50" />
            </div>
            <p className="text-white text-2xl font-light">{c.value}</p>
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/8 bg-white/[0.02] p-5">
          <h3 className="text-white text-sm tracking-wider uppercase font-light mb-4">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-white/30 text-xs">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-3">
                  <div>
                    <p className="text-white/70">{o.orderNumber}</p>
                    <p className="text-white/30 mt-0.5">{o.customer?.name || o.customer?.email || "Guest"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{money(o.total)}</p>
                    <p className="text-white/30 mt-0.5">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-white/8 bg-white/[0.02] p-5">
          <h3 className="text-white text-sm tracking-wider uppercase font-light mb-4">Limited Editions Running Low</h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-white/30 text-xs">All editions healthy</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-3">
                  <p className="text-white/70">{p.title}</p>
                  <p className="text-amber-400/70">{p.edition}/{p.editionTotal}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PAINTINGS ═══════════════ */
const EMPTY_PAINTING = {
  title: "", description: "", story: "", price: "", originalPrice: "",
  width: 24, height: 36,
  medium: "Oil on Canvas", style: "Contemporary", year: 2024,
  edition: 1, editionTotal: 1, isOriginal: true, isFeatured: false,
  isActive: true, inStock: true, frameOptions: ["Black Oak", "Walnut"],
  tags: [] as string[], images: [] as string[], coverImage: "", mainImage: "", categoryId: "",
};

function Paintings() {
  const [items, setItems] = useState<AdminPainting[]>([]);
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingPainting, setEditingPainting] = useState<AdminPainting | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([api.getPaintings(1, 100), api.getCategories()]);
    setLoading(false);
    if (p.ok && p.data) setItems(p.data); else setErr(p.message || "Failed");
    if (c.ok && c.data) setCats(c.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this painting permanently?")) return;
    const res = await api.deletePainting(id);
    if (res.ok) load(); else alert(res.message);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Paintings" subtitle={`${items.length} artworks`} action={
        <button onClick={() => setCreating(true)}
          className="px-4 py-2.5 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
          <Plus size={14} /> Add Painting
        </button>
      } />
      {err && <ErrorBox msg={err} onRetry={load} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="border border-white/8 bg-white/[0.02] overflow-hidden group">
            <div className="aspect-[4/3] bg-white/5 overflow-hidden relative">
              {p.coverImage || p.images?.[0] ? (
                <img src={p.coverImage || p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/15"><ImageIcon size={32} /></div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {p.isFeatured && <span className="px-2 py-0.5 bg-white text-black text-[8px] tracking-wider uppercase">Featured</span>}
                {!p.isActive && <span className="px-2 py-0.5 bg-red-500/80 text-white text-[8px] tracking-wider uppercase">Hidden</span>}
              </div>
            </div>
            <div className="p-4">
              <p className="text-white text-sm font-light truncate">{p.title}</p>
              <p className="text-white/30 text-[10px] tracking-wider uppercase mt-0.5">{p.category?.name || "—"}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-white/70 text-sm">{money(p.price)}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditingPainting(p)} className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => remove(p.id)} className="text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <PaintingForm
          categories={cats}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); load(); }}
        />
      )}

      {editingPainting && (
        <PaintingForm
          painting={editingPainting}
          categories={cats}
          onClose={() => setEditingPainting(null)}
          onSaved={() => { setEditingPainting(null); load(); }}
        />
      )}
    </div>
  );
}

function PaintingForm({
  painting, categories, onClose, onSaved,
}: {
  painting?: AdminPainting;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!painting;
  const initialForm = isEdit ? { ...painting } : { ...EMPTY_PAINTING, categoryId: categories[0]?.id || "" };
  
  const [form, setForm] = useState<Record<string, unknown>>(initialForm);
  const formRef = useRef<Record<string, unknown>>(initialForm);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImagesFiles, setAdditionalImagesFiles] = useState<File[]>([]);
  
  const [coverImagePreview, setCoverImagePreview] = useState<string>(painting?.coverImage || "");
  const [mainImagePreview, setMainImagePreview] = useState<string>(painting?.mainImage || "");
  const [retainedAdditionalImages, setRetainedAdditionalImages] = useState<string[]>(painting?.images || []);
  
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: unknown) => setForm((f) => {
    const next = { ...f, [k]: v };
    formRef.current = next;
    return next;
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setMainImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    setAdditionalImagesFiles(prev => [...prev, ...files]);
    e.target.value = "";
  };

  const save = async () => {
    const currentForm = formRef.current || form || initialForm;
    if (!currentForm.title || !currentForm.description || !currentForm.categoryId || !currentForm.price) {
      setErr("Title, description, price, and category are required fields");
      return;
    }
    setSaving(true);
    setErr("");

    const payload = {
      ...currentForm,
      price: Number(currentForm.price || 0),
      originalPrice: currentForm.originalPrice ? Number(currentForm.originalPrice) : null,
      width: Number(currentForm.width || 24),
      height: Number(currentForm.height || 36),
      year: Number(currentForm.year || 2024),
      edition: Number(currentForm.edition || 1),
      editionTotal: Number(currentForm.editionTotal || 1),
      isOriginal: currentForm.isOriginal === undefined ? true : !!currentForm.isOriginal,
      isFeatured: !!currentForm.isFeatured,
      isActive: currentForm.isActive === undefined ? true : !!currentForm.isActive,
      inStock: currentForm.inStock === undefined ? true : !!currentForm.inStock,
      // For updates, send the array of already hosted images we want to keep
      images: retainedAdditionalImages,
    };
    
    const files = {
      coverImage: coverImageFile || undefined,
      mainImage: mainImageFile || undefined,
      images: additionalImagesFiles.length > 0 ? additionalImagesFiles : undefined,
    };
    
    let res;
    if (isEdit && painting?.id) {
      res = await api.updatePainting(painting.id, payload, files);
    } else {
      res = await api.createPainting(payload, files);
    }

    setSaving(false);
    if (res.ok) onSaved();
    else setErr(res.message || "Save failed");
  };

  const input = "w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20";
  const label = "text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0a0a0a]">
          <h3 className="text-white text-base font-light">{isEdit ? "Edit Painting" : "Add Painting"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <label className={label}>Title *</label>
            <input className={input} value={(form?.title as string) || ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className={label}>Description *</label>
            <textarea className={input} rows={3} value={(form?.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Price (₹) *</label>
              <input type="number" className={input} value={(form?.price as number) || ""} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <label className={label}>Category *</label>
              <select className={input} value={(form?.categoryId as string) || ""} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className={label}>Width (in)</label><input type="number" className={input} value={(form?.width as number) || ""} onChange={(e) => set("width", e.target.value)} /></div>
            <div><label className={label}>Height (in)</label><input type="number" className={input} value={(form?.height as number) || ""} onChange={(e) => set("height", e.target.value)} /></div>
            <div><label className={label}>Year</label><input type="number" className={input} value={(form?.year as number) || ""} onChange={(e) => set("year", e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Medium</label><input className={input} value={(form?.medium as string) || ""} onChange={(e) => set("medium", e.target.value)} /></div>
            <div><label className={label}>Style</label><input className={input} value={(form?.style as string) || ""} onChange={(e) => set("style", e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Edition #</label><input type="number" className={input} value={(form?.edition as number) || ""} onChange={(e) => set("edition", e.target.value)} /></div>
            <div><label className={label}>Total Editions</label><input type="number" className={input} value={(form?.editionTotal as number) || ""} onChange={(e) => set("editionTotal", e.target.value)} /></div>
          </div>

          {/* ═══ Cover Image Upload / Retain ═══ */}
          <div className="border border-white/10 bg-white/[0.02] p-4">
            <h4 className="text-white text-sm font-light mb-1">Cover Image (Thumbnail)</h4>
            <p className="text-white/40 text-[10px] mb-3">Used on grid card layouts. Upload a new asset to overwrite current configurations.</p>
            
            {coverImagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={coverImagePreview} alt="Cover preview" className="h-24 w-24 object-cover border border-white/10" />
                <button type="button" onClick={() => { setCoverImageFile(null); setCoverImagePreview(""); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded"><X size={12} /></button>
              </div>
            )}
            
            <label className="block border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] cursor-pointer p-4 text-center transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
              <Upload size={20} className="text-white/30 mx-auto mb-1" />
              <p className="text-white/50 text-[10px]">Click to upload new cover image</p>
            </label>
          </div>

          {/* ═══ Main Image Upload / Retain ═══ */}
          <div className="border border-white/10 bg-white/[0.02] p-4">
            <h4 className="text-white text-sm font-light mb-1">Main Painting Image</h4>
            <p className="text-white/40 text-[10px] mb-3">Full-resolution artwork shown on details page.</p>
            
            {mainImagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={mainImagePreview} alt="Main preview" className="h-24 w-24 object-cover border border-white/10" />
                <button type="button" onClick={() => { setMainImageFile(null); setMainImagePreview(""); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded"><X size={12} /></button>
              </div>
            )}
            
            <label className="block border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] cursor-pointer p-4 text-center transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
              <Upload size={20} className="text-white/30 mx-auto mb-1" />
              <p className="text-white/50 text-[10px]">Click to upload new main painting image</p>
            </label>
          </div>

          {/* ═══ Additional Gallery Images (Retain + Upload) ═══ */}
          <div className="border border-white/10 bg-white/[0.02] p-4">
            <h4 className="text-white text-sm font-light mb-3">Additional Gallery Images</h4>
            
            {/* Display Hosted Images Already in Database */}
            {retainedAdditionalImages.length > 0 && (
              <div className="mb-4">
                <p className="text-white/40 text-[10px] mb-2 uppercase tracking-wider">Currently Stored:</p>
                <div className="grid grid-cols-4 gap-2">
                  {retainedAdditionalImages.map((imgUrl, i) => (
                    <div key={i} className="relative aspect-square bg-white/5 border border-white/10 overflow-hidden">
                      <img src={imgUrl} alt="Retained asset" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setRetainedAdditionalImages(prev => prev.filter(u => u !== imgUrl))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display newly picked local file buffers */}
            {additionalImagesFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-white/40 text-[10px] mb-2 uppercase tracking-wider">New Additions to Upload:</p>
                <div className="grid grid-cols-4 gap-2">
                  {additionalImagesFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square bg-white/5 border border-white/10 overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt={`Additional local ${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAdditionalImagesFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white flex items-center justify-center"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <label className="block border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] cursor-pointer p-4 text-center transition-colors">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImagesChange} />
              <Upload size={20} className="text-white/30 mx-auto mb-1" />
              <p className="text-white/50 text-[10px]">Click to append more extra images</p>
            </label>
          </div>

          <div>
            <label className={label}>Tags (comma separated)</label>
            <input className={input} placeholder="abstract, calm" value={Array.isArray(form?.tags) ? (form.tags as string[]).join(", ") : ""} onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </div>
          <div>
            <label className={label}>Frame Options (comma separated)</label>
            <input className={input} value={Array.isArray(form?.frameOptions) ? (form.frameOptions as string[]).join(", ") : ""} onChange={(e) => set("frameOptions", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Toggle label="Active (visible)" value={!!form?.isActive} onChange={(v) => set("isActive", v)} />
            <Toggle label="Featured" value={!!form?.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Toggle label="Original" value={!!form?.isOriginal} onChange={(v) => set("isOriginal", v)} />
            <Toggle label="In Stock" value={!!form?.inStock} onChange={(v) => set("inStock", v)} />
          </div>

          {err && <p className="text-red-400/80 text-xs">{err}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t border-white/5 sticky bottom-0 bg-[#0a0a0a]">
          <button onClick={save} disabled={saving} className="flex-1 py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Changes</>}
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-white/10 text-white/50 text-[10px] tracking-[0.2em] uppercase hover:text-white transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ ORDERS ═══════════════ */
function Orders() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<AdminOrder | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getOrders(1, 100, filter || undefined);
    setLoading(false);
    if (res.ok && res.data) setItems(res.data); else setErr(res.message || "Failed");
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: string) => {
    const res = await api.updateOrderStatus(id, status);
    if (res.ok) load(); else alert(res.message);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Orders" subtitle={`${items.length} orders`} />
      {err && <ErrorBox msg={err} onRetry={load} />}

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 text-[10px] tracking-wider uppercase border transition-colors ${filter === "" ? "border-white bg-white text-black" : "border-white/10 text-white/40 hover:text-white"}`}>All</button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-[10px] tracking-wider uppercase border transition-colors ${filter === s ? "border-white bg-white text-black" : "border-white/10 text-white/40 hover:text-white"}`}>{s}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-white/30 text-sm">No orders found</p>
      ) : (
        <div className="border border-white/8 overflow-hidden">
          {items.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="min-w-0">
                <p className="text-white text-sm">{o.orderNumber}</p>
                <p className="text-white/30 text-xs mt-0.5 truncate">{o.shippingName || o.customer?.name || "Guest"} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-white text-sm hidden sm:block">{money(o.total)}</span>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="bg-white/5 border border-white/10 text-white/70 text-[10px] tracking-wider uppercase px-2 py-1.5 focus:outline-none focus:border-white/30">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
                <button onClick={() => setOpen(o)} className="text-white/40 hover:text-white"><Eye size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <OrderDetail order={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-white text-base font-light">{order.orderNumber}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5 text-sm">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2">Customer</p>
            <p className="text-white/80">{order.shippingName}</p>
            <p className="text-white/40 text-xs">{order.shippingEmail} · {order.shippingPhone}</p>
            <p className="text-white/40 text-xs mt-1">{order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
          </div>
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2">Items</p>
            {order.items?.map((it) => (
              <div key={it.id} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-white/70">{it.painting?.title} × {it.quantity} <span className="text-white/30">({it.frame})</span></span>
                <span className="text-white">{money(Number(it.price) * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-white/40 text-xs tracking-wider uppercase">Payment Ref</span>
            <span className="text-white/70 text-xs">{order.paymentReference || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40 text-xs tracking-wider uppercase">Total</span>
            <span className="text-white text-lg font-light">{money(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PAYMENTS (verification) ═══════════════ */
function Payments() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getPendingPayments();
    setLoading(false);
    if (res.ok && res.data) setItems(res.data); else setErr(res.message || "Failed");
  }, []);
  useEffect(() => { load(); }, [load]);

  const verify = async (id: string, approved: boolean) => {
    const res = await api.verifyPayment(id, approved);
    if (res.ok) load(); else alert(res.message);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Payment Verification" subtitle={`${items.length} awaiting review`} action={
        <button onClick={load} className="text-white/40 hover:text-white"><RefreshCw size={16} /></button>
      } />
      {err && <ErrorBox msg={err} onRetry={load} />}

      {items.length === 0 ? (
        <div className="border border-white/8 bg-white/[0.02] p-10 text-center">
          <BadgeIndianRupee size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No payments pending verification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="border border-white/8 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-white text-sm">{o.orderNumber}</p>
                  <p className="text-white/40 text-xs mt-1">{o.shippingName} · {o.shippingEmail}</p>
                  <p className="text-white/60 text-xs mt-2">Amount: <span className="text-white">{money(o.total)}</span></p>
                  <p className="text-white/60 text-xs mt-1">UPI Ref: <span className="text-amber-400/80 font-mono">{o.paymentReference || "—"}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verify(o.id, true)} className="px-4 py-2.5 bg-emerald-500/90 text-white text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2"><Check size={14} /> Approve</button>
                  <button onClick={() => verify(o.id, false)} className="px-4 py-2.5 border border-red-500/30 text-red-400/80 text-[10px] tracking-[0.15em] uppercase hover:bg-red-500/10 transition-colors flex items-center gap-2"><X size={14} /> Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ CATEGORIES ═══════════════ */
function Categories() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getCategories();
    setLoading(false);
    if (res.ok && res.data) setItems(res.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return;
    setAdding(true);
    const res = await api.createCategory(name.trim());
    setAdding(false);
    if (res.ok) { setName(""); load(); } else alert(res.message);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await api.deleteCategory(id);
    if (res.ok) load(); else alert(res.message);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Categories" subtitle={`${items.length} categories`} />
      <div className="flex gap-2 mb-6 max-w-md">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" onKeyDown={(e) => e.key === "Enter" && add()} className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white/30 placeholder:text-white/20" />
        <button onClick={add} disabled={adding} className="px-4 py-2.5 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-60">{adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((c) => (
          <div key={c.id} className="border border-white/8 bg-white/[0.02] p-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm">{c.name}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{c._count?.paintings ?? 0} paintings</p>
            </div>
            <button onClick={() => remove(c.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ SETTINGS (payment) ═══════════════ */
function SettingsPanel() {
  const [s, setS] = useState<PaymentSettings>({ upiId: "", payeeName: "", instructions: "", qrImage: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getPaymentSettings();
    setLoading(false);
    if (res.ok && res.data) setS(res.data); else setErr(res.message || "Failed");
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setErr("");
    const res = await api.updatePaymentSettings(s);
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); } else setErr(res.message || "Save failed");
  };

  const input = "w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 placeholder:text-white/20";
  const label = "text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5 block";

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Payment Settings" subtitle="Configure UPI checkout details" />
      {err && <ErrorBox msg={err} onRetry={load} />}
      <div className="max-w-lg space-y-4 border border-white/8 bg-white/[0.02] p-6">
        <div><label className={label}>UPI ID</label><input className={input} value={s.upiId} onChange={(e) => setS({ ...s, upiId: e.target.value })} /></div>
        <div><label className={label}>Payee Name</label><input className={input} value={s.payeeName} onChange={(e) => setS({ ...s, payeeName: e.target.value })} /></div>
        <div><label className={label}>QR Image URL (optional)</label><input className={input} placeholder="https://…" value={s.qrImage || ""} onChange={(e) => setS({ ...s, qrImage: e.target.value })} /></div>
        <div><label className={label}>Instructions</label><textarea rows={4} className={input} value={s.instructions} onChange={(e) => setS({ ...s, instructions: e.target.value })} /></div>
        <button onClick={save} disabled={saving} className="w-full py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : saved ? <><Check size={14} /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ SHARED UI ═══════════════ */
function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="text-white text-2xl md:text-3xl font-light tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/30 text-xs tracking-wider uppercase mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-xs">
      <span className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-white" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${value ? "left-[18px] bg-black" : "left-0.5 bg-white/60"}`} />
      </span>
      <span className="text-white/50">{label}</span>
    </button>
  );
}

function Loading() {
  return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="text-white/30 animate-spin" /></div>;
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="border border-red-500/20 bg-red-500/5 p-5 mb-6 flex items-center justify-between">
      <p className="text-red-400/80 text-xs">{msg}</p>
      <button onClick={onRetry} className="text-white/50 hover:text-white text-xs flex items-center gap-2"><RefreshCw size={12} /> Retry</button>
    </div>
  );
}