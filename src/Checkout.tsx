import { useState, useContext } from "react";
import { CartContext } from "./CartContext";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useToast } from "./Toast";
import { useNavigate } from "react-router-dom";

// ── rate-limit: max 3 orders per 10 min from same browser ──────────────────
function checkRateLimit(): boolean {
  const key = "order_times";
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const stored: number[] = JSON.parse(localStorage.getItem(key) || "[]");
  const recent = stored.filter((t) => now - t < window);
  if (recent.length >= 3) return false;
  recent.push(now);
  localStorage.setItem(key, JSON.stringify(recent));
  return true;
}

function generateOrderNumber(): string {
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `AQ-${rand}`;
}

// IBAN & QR data (customize these)
const BENEFIT_IBAN = "BH29BMAG1299123456BHD01";
const BENEFIT_QR   = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BenefitPay:BH29BMAG1299123456BHD01";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [address,  setAddress]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [payment,  setPayment]  = useState<"cod"|"benefit">("cod");
  const [delivery, setDelivery] = useState<"delivery"|"pickup">("delivery");

  const DELIVERY_FEE = 2;
  const subtotal = cart.reduce((s: number, i: any) => s + (i.price||0)*(i.quantity||0), 0);
  const total    = delivery === "delivery" ? subtotal + DELIVERY_FEE : subtotal;

  // ── validation ──────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!name.trim())        return "أدخل اسمك الكامل";
    if (!/^\d{7,12}$/.test(phone.replace(/\s/g,""))) return "رقم الهاتف غير صحيح";
    if (delivery === "delivery" && !address.trim()) return "أدخل العنوان";
    return null;
  };

  const handleOrder = async () => {
    const err = validate();
    if (err) { showToast(err, "warning"); return; }
    if (cart.length === 0) { showToast("السلة فارغة", "warning"); return; }
    if (!checkRateLimit()) {
      showToast("الرجاء الانتظار قليلاً قبل إرسال طلب جديد ⏳", "warning");
      return;
    }

    try {
      setLoading(true);

      // ── stock check ────────────────────────────────────────────────────
      for (const item of cart) {
        if (!item?.id) continue;
        const snap = await getDoc(doc(db, "products", item.id));
        if (!snap.exists()) continue;
        const data: any = snap.data() || {};
        const size = typeof item.selectedSize === "string" ? item.selectedSize : null;

        if (data.sizes && size && typeof data.sizes === "object" && data.sizes[size] !== undefined) {
          if ((data.sizes[size] || 0) < (item.quantity || 0)) {
            showToast(`المنتج "${item.name}" غير متوفر بالكمية المطلوبة ❌`, "error");
            setLoading(false); return;
          }
        } else {
          if ((data.quantity || 0) < (item.quantity || 0)) {
            showToast(`المنتج "${item.name}" غير متوفر بالكمية المطلوبة ❌`, "error");
            setLoading(false); return;
          }
        }
      }

      const orderNumber = generateOrderNumber();

      // ── save order ─────────────────────────────────────────────────────
      await addDoc(collection(db, "orders"), {
        orderNumber,
        customer:      { name: name.trim(), phone: phone.trim(), address: address.trim() },
        items:         cart,
        subtotal,
        deliveryFee:   delivery === "delivery" ? DELIVERY_FEE : 0,
        total,
        paymentMethod: payment,
        deliveryType:  delivery,
        status:        "pending",
        createdAt:     serverTimestamp(),
      });

      // ── deduct stock ───────────────────────────────────────────────────
      for (const item of cart) {
        if (!item?.id) continue;
        const ref  = doc(db, "products", item.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) continue;
        const data: any = snap.data() || {};
        const size = typeof item.selectedSize === "string" ? item.selectedSize : null;

        if (data.sizes && size && typeof data.sizes === "object" && data.sizes[size] !== undefined) {
          await updateDoc(ref, { [`sizes.${size}`]: (data.sizes[size]||0) - (item.quantity||0) });
        } else {
          await updateDoc(ref, { quantity: (data.quantity||0) - (item.quantity||0) });
        }
      }

      clearCart();
      showToast(`تم إرسال طلبك بنجاح! رقم الطلب: ${orderNumber} 🎉`, "success");
      setTimeout(() => navigate("/track/" + orderNumber), 2000);

    } catch (e) {
      console.error(e);
      showToast("حدث خطأ، حاول مرة أخرى 😢", "error");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2 style={{ color: "#D4AF37" }}>السلة فارغة 🛒</h2>
        <button onClick={() => navigate("/shop")} style={goldBtn}>العودة للمتجر</button>
      </div>
    );

  return (
    <div style={{ padding: "30px 20px", maxWidth: "560px", margin: "0 auto", direction: "rtl" }}>
      <h1 style={{ color: "#D4AF37", textAlign: "center", marginBottom: "28px", fontSize: "22px" }}>
        🧾 إتمام الطلب
      </h1>

      {/* ── Customer Info ── */}
      <Section title="معلومات العميل">
        <input placeholder="الاسم الكامل" value={name} onChange={e=>setName(e.target.value)} style={inp} />
        <input placeholder="رقم الهاتف" value={phone} onChange={e=>setPhone(e.target.value)} style={inp} dir="ltr" />
      </Section>

      {/* ── Delivery Type ── */}
      <Section title="طريقة الاستلام">
        <div style={{ display: "flex", gap: "10px" }}>
          {(["delivery","pickup"] as const).map(d=>(
            <button key={d} onClick={()=>setDelivery(d)}
              style={{flex:1,padding:"12px",borderRadius:"12px",border:`2px solid ${delivery===d?"#D4AF37":"#333"}`,
                background:delivery===d?"#D4AF3722":"transparent",color:delivery===d?"#D4AF37":"#888",
                cursor:"pointer",fontWeight:"bold",fontSize:"14px",transition:"0.2s"}}>
              {d==="delivery"?"🚗 توصيل (+2 BD)":"🤝 استلام شخصي"}
            </button>
          ))}
        </div>
        {delivery==="delivery" && (
          <input placeholder="العنوان التفصيلي" value={address} onChange={e=>setAddress(e.target.value)} style={{...inp,marginTop:"10px"}} />
        )}
        {delivery==="pickup" && (
          <p style={{color:"#f59e0b",fontSize:"13px",marginTop:"10px",background:"#f59e0b11",padding:"10px",borderRadius:"8px",border:"1px solid #f59e0b33"}}>
            📞 سيتواصل معك البائع لتحديد وقت الاستلام
          </p>
        )}
      </Section>

      {/* ── Payment Method ── */}
      <Section title="طريقة الدفع">
        <div style={{ display: "flex", gap: "10px" }}>
          {(["cod","benefit"] as const).map(p=>(
            <button key={p} onClick={()=>setPayment(p)}
              style={{flex:1,padding:"12px",borderRadius:"12px",border:`2px solid ${payment===p?"#D4AF37":"#333"}`,
                background:payment===p?"#D4AF3722":"transparent",color:payment===p?"#D4AF37":"#888",
                cursor:"pointer",fontWeight:"bold",fontSize:"14px",transition:"0.2s"}}>
              {p==="cod"?"💵 كاش عند الاستلام":"💳 Benefit"}
            </button>
          ))}
        </div>

        {payment==="benefit" && (
          <div style={{marginTop:"14px",background:"#0B0F1A",borderRadius:"12px",padding:"16px",border:"1px solid #D4AF3733",textAlign:"center"}}>
            <p style={{color:"#D4AF37",fontWeight:"bold",marginBottom:"10px"}}>تحويل عبر Benefit</p>
            <img src={BENEFIT_QR} alt="QR Code" style={{borderRadius:"10px",marginBottom:"10px",background:"white",padding:"6px"}} />
            <p style={{color:"#888",fontSize:"12px",marginBottom:"6px"}}>أو التحويل عبر IBAN:</p>
            <p style={{color:"white",fontSize:"13px",fontFamily:"monospace",letterSpacing:"1px",background:"#111",padding:"8px",borderRadius:"8px",userSelect:"all"}}>
              {BENEFIT_IBAN}
            </p>
            <p style={{color:"#f59e0b",fontSize:"12px",marginTop:"8px"}}>⚠️ أرسل إيصال الدفع على واتساب بعد الطلب</p>
          </div>
        )}
      </Section>

      {/* ── Order Summary ── */}
      <Section title="ملخص الطلب">
        {cart.map((item:any,i:number)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",color:"#ccc",fontSize:"13px",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
            <span>{item.name}{item.selectedSize&&` (${item.selectedSize})`} × {item.quantity}</span>
            <span style={{color:"#D4AF37"}}>{(item.price*item.quantity).toFixed(3)} BD</span>
          </div>
        ))}
        {delivery==="delivery" && (
          <div style={{display:"flex",justifyContent:"space-between",color:"#888",fontSize:"13px",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
            <span>🚗 رسوم التوصيل</span>
            <span style={{color:"#D4AF37"}}>{DELIVERY_FEE}.000 BD</span>
          </div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",color:"white",fontWeight:"bold",fontSize:"16px",paddingTop:"10px",marginTop:"4px"}}>
          <span>الإجمالي</span>
          <span style={{color:"#D4AF37"}}>{total.toFixed(3)} BD</span>
        </div>
      </Section>

      <button onClick={handleOrder} disabled={loading}
        style={{...goldBtn,opacity:loading?0.6:1,width:"100%",marginTop:"6px"}}>
        {loading ? "جاري الإرسال..." : "تأكيد الطلب 🚀"}
      </button>
    </div>
  );
}

function Section({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{background:"#111",border:"1px solid #222",borderRadius:"14px",padding:"16px",marginBottom:"16px"}}>
      <p style={{color:"#D4AF37",fontWeight:"bold",marginBottom:"12px",fontSize:"14px"}}>◆ {title}</p>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width:"100%",padding:"11px 14px",borderRadius:"10px",border:"1px solid #333",
  background:"#0B0F1A",color:"white",fontSize:"14px",boxSizing:"border-box",marginBottom:"8px",
};
const goldBtn: React.CSSProperties = {
  padding:"13px 28px",background:"#D4AF37",color:"#000",border:"none",borderRadius:"12px",
  fontWeight:"bold",cursor:"pointer",fontSize:"15px",
};

export default Checkout;
