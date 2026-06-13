import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft,
  Truck, Copy, Check, QrCode, Smartphone,
  ShieldCheck, CircleCheck, Tag,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Payment settings — fetched from backend; falls back to
   defaults if API is unreachable (admin-configurable).
   ───────────────────────────────────────────────────────── */
interface PaymentSettings {
  upiId: string;
  payeeName: string;
  instructions: string;
  qrImage?: string;
}

const DEFAULT_SETTINGS: PaymentSettings = {
  upiId: "7042089820@upi",
  payeeName: "Yashika's Gallery",
  instructions:
    "Scan the QR code or pay directly to the UPI ID. After completing the payment, enter the UPI Transaction ID below and place your order. Your order will be confirmed once the payment is verified.",
};

async function fetchPaymentSettings(): Promise<PaymentSettings> {
  try {
    const res = await fetch("/api/settings/payment");
    if (!res.ok) throw new Error("unavailable");
    const json = await res.json();
    if (json?.data?.upiId) return { ...DEFAULT_SETTINGS, ...json.data };
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_FORM: CustomerForm = {
  name: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
};

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Y-${ts}-${rand}`;
}

export default function CheckoutPage() {
  const {
    cart, removeFromCart, updateQuantity, getCartTotal, setCurrentView,
  } = useStore();

  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [paymentMethod] = useState<"upi" | "card" | "gateway">("upi");
  const [txnRef, setTxnRef] = useState("");
  const [txnError, setTxnError] = useState("");
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSettings().then(setSettings);
  }, []);

  const subtotal = getCartTotal();
  const shipping = 0;
  const total = subtotal + shipping;

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: settings.upiId,
      pn: settings.payeeName,
      am: String(total),
      cu: "INR",
      tn: "Yashika's Gallery Order",
    });
    return `upi://pay?${params.toString()}`;
  }, [settings, total]);

  const qrSrc = settings.qrImage
    ? settings.qrImage
    : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;

  const setField = (key: keyof CustomerForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<CustomerForm> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[+\d][\d\s-]{7,14}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.zip.trim()) e.zip = "Postal code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const placeOrder = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (paymentMethod === "upi" && !txnRef.trim()) {
      setTxnError("Enter the UPI Transaction ID / Reference Number after paying");
      return;
    }
    setTxnError("");
    setPlacing(true);

    const orderPayload = {
      items: cart.map((i) => ({
        paintingId: i.artwork.id,
        quantity: i.quantity,
        frame: i.frame,
      })),
      couponCode: coupon || undefined,
      shipping: {
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, state: form.state,
        zip: form.zip, country: "IN",
      },
      paymentMethod: "upi",
      paymentReference: txnRef.trim(),
      notes: "Status: Payment Verification Pending",
    };

    let number = generateOrderNumber();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.orderNumber) number = json.data.orderNumber;
      }
    } catch {
      // Backend offline — keep locally generated order number
    }

    setTimeout(() => {
      setOrderNumber(number);
      // Clear the cart
      cart.forEach((i) => removeFromCart(i.artwork.id));
      setPlacing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  };

  /* ── Success screen ── */
  if (orderNumber) {
    return (
      <section className="min-h-screen bg-black pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <CircleCheck size={36} className="text-emerald-400" />
          </div>
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-4">Order Received</p>
          <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-6">
            Thank you for your order
          </h1>
          <div className="bg-white/5 border border-white/10 p-6 mb-8">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2">Order Number</p>
            <p className="text-white text-2xl font-light tracking-wider">{orderNumber}</p>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-3">
            Your payment is being verified. You will receive a confirmation
            once the administrator approves your payment reference.
          </p>
          <p className="text-white/25 text-xs tracking-wider uppercase mb-10">
            Status: Payment Verification Pending
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView("collection")}
              className="px-8 py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors"
            >
              Continue Browsing
            </button>
            <button
              onClick={() => setCurrentView("home")}
              className="px-8 py-4 border border-white/15 text-white/60 text-xs tracking-[0.2em] uppercase hover:border-white/40 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  /* ── Empty cart ── */
  if (cart.length === 0) {
    return (
      <section className="min-h-screen bg-black pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="text-white/10 mx-auto mb-6" />
          <h1 className="text-white text-2xl font-light mb-3">Your cart is empty</h1>
          <p className="text-white/30 text-sm mb-8">Discover artworks before checking out.</p>
          <button
            onClick={() => setCurrentView("collection")}
            className="px-8 py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-3"
          >
            Explore Collection <ArrowRight size={14} />
          </button>
        </div>
      </section>
    );
  }

  const inputCls = (err?: string) =>
    `w-full bg-white/5 border ${err ? "border-red-400/50" : "border-white/10"} text-white text-sm px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20`;

  return (
    <section className="min-h-screen bg-black pt-28 md:pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => setCurrentView("collection")}
            className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Continue Shopping
          </button>
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-3">Secure Checkout</p>
          <h1 className="text-white text-4xl md:text-5xl font-light tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
          {/* ════ LEFT: forms ════ */}
          <div className="space-y-12">
            {/* Customer Information */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 rounded-full bg-white text-black text-xs flex items-center justify-center font-medium">1</span>
                <h2 className="text-white text-lg font-light tracking-tight">Customer Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <input placeholder="Full Name *" value={form.name}
                    onChange={(e) => setField("name", e.target.value)} className={inputCls(errors.name)} />
                  {errors.name && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.name}</p>}
                </div>
                <div>
                  <input placeholder="Email *" type="email" value={form.email}
                    onChange={(e) => setField("email", e.target.value)} className={inputCls(errors.email)} />
                  {errors.email && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.email}</p>}
                </div>
                <div>
                  <input placeholder="Phone Number *" value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)} className={inputCls(errors.phone)} />
                  {errors.phone && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input placeholder="Address *" value={form.address}
                    onChange={(e) => setField("address", e.target.value)} className={inputCls(errors.address)} />
                  {errors.address && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.address}</p>}
                </div>
                <div>
                  <input placeholder="City *" value={form.city}
                    onChange={(e) => setField("city", e.target.value)} className={inputCls(errors.city)} />
                  {errors.city && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.city}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input placeholder="State *" value={form.state}
                      onChange={(e) => setField("state", e.target.value)} className={inputCls(errors.state)} />
                    {errors.state && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.state}</p>}
                  </div>
                  <div>
                    <input placeholder="Postal Code *" value={form.zip}
                      onChange={(e) => setField("zip", e.target.value)} className={inputCls(errors.zip)} />
                    {errors.zip && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{errors.zip}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 rounded-full bg-white text-black text-xs flex items-center justify-center font-medium">2</span>
                <h2 className="text-white text-lg font-light tracking-tight">Payment Method</h2>
              </div>

              {/* UPI label */}
              <div className="flex items-center gap-3 mb-6 px-4 py-3 border border-white bg-white/5 w-full sm:w-48">
                <Smartphone size={16} className="text-white" />
                <p className="text-xs tracking-wider text-white">UPI Payment</p>
              </div>

              {/* UPI panel */}
              <AnimatePresence mode="wait">
                {paymentMethod === "upi" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border border-white/10 bg-white/[0.03] p-6 md:p-8"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      {/* QR */}
                      <div className="flex-shrink-0 text-center">
                        <div className="bg-white p-3 inline-block">
                          <img src={qrSrc} alt="UPI QR Code" width={200} height={200} className="block" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3 text-white/30 text-[10px] tracking-wider uppercase">
                          <QrCode size={12} /> Scan to Pay ₹{total.toLocaleString()}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 w-full space-y-5">
                        <div>
                          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2">UPI ID</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/40 border border-white/10 px-4 py-3 text-white text-sm tracking-wider">
                              {settings.upiId}
                            </code>
                            <button
                              onClick={copyUpiId}
                              className="px-4 py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2 text-xs"
                            >
                              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                              {copied ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <p className="text-white/40 text-xs leading-relaxed">{settings.instructions}</p>

                        <div>
                          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2">
                            UPI Transaction ID / Reference Number *
                          </p>
                          <input
                            placeholder="e.g. 425019283746"
                            value={txnRef}
                            onChange={(e) => { setTxnRef(e.target.value); setTxnError(""); }}
                            className={inputCls(txnError)}
                          />
                          {txnError && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wider">{txnError}</p>}
                        </div>

                        <div className="flex items-center gap-2 text-white/25 text-[10px]">
                          <ShieldCheck size={12} />
                          Your order is confirmed after the payment is manually verified.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ════ RIGHT: order summary ════ */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <h2 className="text-white text-sm tracking-[0.2em] uppercase font-light mb-6 flex items-center gap-3">
                <ShoppingBag size={14} className="text-white/40" /> Order Summary
              </h2>

              <div className="space-y-5 mb-6 max-h-[340px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item.artwork.id}-${item.frame}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-white/5 overflow-hidden flex-shrink-0">
                      <img src={item.artwork.coverImage || item.artwork.image} alt={item.artwork.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-light truncate">{item.artwork.title}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Frame: {item.frame}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                            className="w-6 h-6 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
                            <Minus size={9} />
                          </button>
                          <span className="text-white text-xs w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                            className="w-6 h-6 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
                            <Plus size={9} />
                          </button>
                        </div>
                        <p className="text-white text-xs">₹{(item.artwork.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.artwork.id)}
                      className="text-white/20 hover:text-red-400 transition-colors self-start">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                  />
                </div>
                <button className="px-4 py-2.5 border border-white/10 text-white/40 text-[10px] tracking-[0.15em] uppercase hover:border-white/30 hover:text-white transition-colors">
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 py-5 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 tracking-wider uppercase">Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 tracking-wider uppercase flex items-center gap-2">
                    <Truck size={11} /> Shipping
                  </span>
                  <span className="text-emerald-400/80">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Total</span>
                  <span className="text-white text-2xl font-light">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full py-4 mt-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {placing ? "Placing Order…" : "Place Order"}
                {!placing && <ArrowRight size={14} />}
              </button>
              <p className="text-white/20 text-[10px] text-center mt-4 tracking-wider">
                Order status: Payment Verification Pending until approved
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
