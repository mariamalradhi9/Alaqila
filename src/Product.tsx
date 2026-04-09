import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CartContext } from "./CartContext";
import { useToast } from "./Toast";

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "products", id)).then(snap => {
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  if (!product)
    return <h2 style={{ color: "#D4AF37", textAlign: "center", marginTop: "80px" }}>جاري التحميل...</h2>;

  const isSoldOut = product.sizes
    ? Object.values(product.sizes).every((q: any) => Number(q) === 0)
    : Number(product.quantity ?? 0) === 0;

  // Stock level
  const stockLevel = product.sizes
    ? Object.values(product.sizes).reduce((s: number, q: any) => s + Number(q), 0)
    : Number(product.quantity ?? 0);

  const stockColor = stockLevel === 0 ? "#ef4444" : stockLevel <= 3 ? "#f59e0b" : "#22c55e";
  const stockLabel = stockLevel === 0
    ? "نفذ المخزون"
    : stockLevel <= 3
      ? `⚠️ باقي ${stockLevel} فقط!`
      : `✅ متوفر (${stockLevel} قطعة)`;

  return (
    <div style={{ background: "#0B0F1A", minHeight: "100vh", padding: "40px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{
        display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start",
        background: "#111", padding: "28px", borderRadius: "20px",
        border: "1px solid #222", maxWidth: "860px", width: "100%",
      }}>
        {/* Media */}
        <div style={{ flex: "1 1 280px", maxWidth: "360px", margin: "0 auto" }}>
          {product.video ? (
            <video src={product.video} autoPlay loop muted playsInline
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "14px", boxShadow: "0 0 25px rgba(212,175,55,0.25)" }} />
          ) : product.image ? (
            <img src={product.image} alt={product.name}
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "14px", boxShadow: "0 0 25px rgba(212,175,55,0.25)" }} />
          ) : (
            <div style={{ width: "100%", aspectRatio: "1", borderRadius: "14px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
              لا توجد صورة
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ color: "white", flex: "1 1 240px" }}>
          <h1 style={{ color: "#D4AF37", marginBottom: "8px", fontSize: "clamp(20px,4vw,28px)" }}>{product.name}</h1>
          <h2 style={{ color: "#ccc", marginBottom: "12px", fontSize: "clamp(16px,3vw,22px)" }}>{product.price} BD</h2>

          {/* Stock badge */}
          <span style={{
            display: "inline-block", padding: "4px 12px", borderRadius: "20px",
            background: stockColor + "22", color: stockColor,
            border: `1px solid ${stockColor}44`, fontSize: "13px",
            fontWeight: "bold", marginBottom: "16px",
          }}>
            {stockLabel}
          </span>

          {/* Sizes */}
          {product.sizes && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ color: "#888", fontSize: "13px", marginBottom: "8px" }}>اختر المقاس:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(product.sizes).map(([size, qty]: any) => (
                  <button key={size} onClick={() => qty > 0 && setSelectedSize(size)}
                    style={{
                      padding: "8px 14px", borderRadius: "8px",
                      border: selectedSize === size ? "2px solid #D4AF37" : "1px solid #444",
                      background: selectedSize === size ? "#D4AF3722" : qty === 0 ? "#1a1a1a" : "transparent",
                      color: qty === 0 ? "#444" : "white",
                      cursor: qty === 0 ? "not-allowed" : "pointer", fontSize: "13px",
                    }}>
                    {size} {qty === 0 && <span style={{ fontSize: "10px" }}>(نفذ)</span>}
                    {qty > 0 && qty <= 3 && <span style={{ color: "#f59e0b", fontSize: "10px", marginRight: "4px" }}>({qty})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
            قطعة أنيقة تضيف لمسة فخمة لإطلالتك ✨
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {isSoldOut ? (
              <button disabled style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: "#333", color: "#666", cursor: "not-allowed", fontWeight: "bold" }}>
                Sold Out ❌
              </button>
            ) : (
              <button onClick={() => {
                if (product.sizes && !selectedSize) { showToast("اختر المقاس أولاً ⚠️", "warning"); return; }
                addToCart({ ...product, selectedSize });
                showToast(`تمت إضافة "${product.name}" للسلة 🛒`, "success");
              }} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: "#D4AF37", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
                أضف للسلة 🛒
              </button>
            )}
            <button onClick={() => navigate("/shop")} style={{ padding: "12px 20px", borderRadius: "12px", border: "1px solid #333", background: "transparent", color: "#aaa", cursor: "pointer" }}>
              ← رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
