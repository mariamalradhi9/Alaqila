import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const deliverySteps = [
  { key: "pending",    label: "تم تقديم الطلب",    icon: "📋" },
  { key: "confirmed",  label: "تم التأكيد",          icon: "✅" },
  { key: "on_the_way", label: "في الطريق",           icon: "🚗" },
  { key: "delivered",  label: "تم التوصيل",          icon: "📦" },
];

const pickupSteps = [
  { key: "pending",   label: "تم تقديم الطلب", icon: "📋" },
  { key: "confirmed", label: "تم التأكيد",      icon: "✅" },
  { key: "collected", label: "تم الاستلام",     icon: "🤝" },
];

const statusColors: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#22c55e", on_the_way: "#3b82f6",
  delivered: "#8b5cf6", collected: "#8b5cf6", rejected: "#ef4444",
};

function TrackOrder() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(orderNumber || "");

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("orderNumber", "==", num.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setOrder(null);
      }
    } catch { setOrder(null); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (orderNumber) fetchOrder(orderNumber);
    else setLoading(false);
  }, [orderNumber]);

  const steps = order?.deliveryType === "pickup" ? pickupSteps : deliverySteps;
  const currentIdx = order ? steps.findIndex((s) => s.key === order.status) : -1;

  return (
    <div style={{ minHeight: "100vh", background: "#0B0F1A", padding: "40px 20px", direction: "rtl" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h1 style={{ color: "#D4AF37", textAlign: "center", marginBottom: "30px", fontSize: "22px" }}>
          📦 تتبع طلبك
        </h1>

        {/* Search */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
          <input
            placeholder="أدخل رقم الطلب (مثال: AQ-12345)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrder(searchVal)}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #333", background: "#111", color: "white", fontSize: "14px" }}
            dir="ltr"
          />
          <button
            onClick={() => fetchOrder(searchVal)}
            style={{ padding: "12px 18px", background: "#D4AF37", border: "none", borderRadius: "10px", color: "#000", fontWeight: "bold", cursor: "pointer" }}
          >
            بحث
          </button>
        </div>

        {loading && <p style={{ color: "#888", textAlign: "center" }}>جاري البحث...</p>}

        {!loading && !order && orderNumber && (
          <div style={{ textAlign: "center", background: "#111", borderRadius: "14px", padding: "30px", border: "1px solid #222" }}>
            <p style={{ color: "#ef4444", fontSize: "16px" }}>❌ لم يتم العثور على الطلب</p>
            <p style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}>تأكد من رقم الطلب وحاول مجدداً</p>
          </div>
        )}

        {order && (
          <div style={{ background: "#111", borderRadius: "16px", padding: "24px", border: "1px solid #222" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              <div>
                <p style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "18px", margin: 0 }}>
                  #{order.orderNumber}
                </p>
                <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                  {order.createdAt?.toDate?.()?.toLocaleString("ar-BH") || "—"}
                </p>
              </div>
              {order.status === "rejected" ? (
                <span style={{ background: "#ef444422", color: "#ef4444", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", border: "1px solid #ef444444", alignSelf: "center" }}>
                  ❌ مرفوض
                </span>
              ) : (
                <span style={{ background: statusColors[order.status] + "22", color: statusColors[order.status], padding: "6px 14px", borderRadius: "20px", fontSize: "13px", border: `1px solid ${statusColors[order.status]}44`, alignSelf: "center" }}>
                  {steps.find(s => s.key === order.status)?.icon} {steps.find(s => s.key === order.status)?.label}
                </span>
              )}
            </div>

            {/* Rejection note */}
            {order.status === "rejected" && (
              <div style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: "10px", padding: "14px", marginBottom: "18px", color: "#ef4444", fontSize: "13px" }}>
                ⚠️ تم رفض طلبك من قِبل البائع. يرجى التواصل معنا لمعرفة السبب.
              </div>
            )}

            {/* Progress bar */}
            {order.status !== "rejected" && (
              <div style={{ marginBottom: "22px" }}>
                {steps.map((step, idx) => {
                  const done    = idx < currentIdx;
                  const current = idx === currentIdx;
                  const future  = idx > currentIdx;
                  return (
                    <div key={step.key} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: idx < steps.length - 1 ? "0" : "0" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: done || current ? "#D4AF37" : "#1a1a1a",
                          border: `2px solid ${done || current ? "#D4AF37" : "#333"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "16px", flexShrink: 0,
                          boxShadow: current ? "0 0 12px #D4AF3766" : "none",
                          transition: "0.3s",
                        }}>
                          {done ? "✓" : step.icon}
                        </div>
                        {idx < steps.length - 1 && (
                          <div style={{ width: "2px", height: "28px", background: done ? "#D4AF37" : "#222", transition: "0.3s" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: "6px", paddingBottom: idx < steps.length - 1 ? "16px" : "0" }}>
                        <p style={{ margin: 0, color: future ? "#555" : "white", fontWeight: current ? "bold" : "normal", fontSize: "14px" }}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Items */}
            <div style={{ background: "#0B0F1A", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
              <p style={{ color: "#D4AF37", fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>المنتجات:</p>
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "13px", padding: "3px 0" }}>
                  <span>{item.name}{item.selectedSize && ` (${item.selectedSize})`} × {item.quantity}</span>
                  <span style={{ color: "#D4AF37" }}>{(item.price * item.quantity).toFixed(3)} BD</span>
                </div>
              ))}
              {order.deliveryFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "13px", padding: "3px 0" }}>
                  <span>رسوم التوصيل</span>
                  <span style={{ color: "#D4AF37" }}>{(order.deliveryFee).toFixed(3)} BD</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "white", fontWeight: "bold", fontSize: "15px", borderTop: "1px solid #222", paddingTop: "8px", marginTop: "6px" }}>
                <span>الإجمالي</span>
                <span style={{ color: "#D4AF37" }}>{(order.total || 0).toFixed(3)} BD</span>
              </div>
            </div>

            {/* Pickup note */}
            {order.deliveryType === "pickup" && order.status === "confirmed" && (
              <p style={{ color: "#f59e0b", fontSize: "13px", background: "#f59e0b11", padding: "10px", borderRadius: "8px", border: "1px solid #f59e0b33" }}>
                📞 سيتواصل معك البائع قريباً لتحديد وقت الاستلام
              </p>
            )}
          </div>
        )}

        <button onClick={() => navigate("/shop")} style={{ marginTop: "20px", background: "transparent", border: "1px solid #333", color: "#888", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
          ← العودة للمتجر
        </button>
      </div>
    </div>
  );
}

export default TrackOrder;
