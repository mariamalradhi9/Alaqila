import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CartContext } from "./CartContext";

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState("");

  const getProduct = async () => {
    if (!id) return;

    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setProduct(docSnap.data());
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  if (!product)
    return (
      <h2 style={{ color: "#D4AF37", textAlign: "center", marginTop: "50px" }}>
        جاري التحميل...
      </h2>
    );

  // 🔥 دعم الاثنين (sizes + quantity)
  const isSoldOut = product.sizes
    ? Object.values(product.sizes).every((q: any) => Number(q) === 0)
    : Number(product.quantity ?? 0) === 0;

  return (
    <div
      style={{
        background: "#0B0F1A",
        minHeight: "100vh",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#111",
          padding: "30px",
          borderRadius: "20px",
          border: "1px solid #222",
          maxWidth: "900px",
        }}
      >
        {/* الصورة */}
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "350px",
            height: "350px",
            objectFit: "cover",
            borderRadius: "15px",
            boxShadow: "0 0 25px rgba(212, 175, 55, 0.3)",
          }}
        />

        {/* التفاصيل */}
        <div style={{ color: "white", maxWidth: "400px" }}>
          <h1 style={{ color: "#D4AF37", marginBottom: "10px" }}>
            {product.name}
          </h1>

          <h2 style={{ color: "#ccc" }}>
            {product.price} BD
          </h2>

          {/* 🔥 المقاسات */}
          {product.sizes && (
            <div style={{ marginTop: "15px" }}>
              <p>اختر المقاس:</p>

              {Object.entries(product.sizes).map(([size, qty]: any) => (
                <button
                  key={size}
                  onClick={() => qty > 0 && setSelectedSize(size)}
                  style={{
                    margin: "5px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border:
                      selectedSize === size
                        ? "2px solid #D4AF37"
                        : "1px solid #444",
                    background: qty === 0 ? "#333" : "transparent",
                    color: qty === 0 ? "#777" : "white",
                    cursor: qty === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {size} {qty === 0 && "(نفذ)"}
                </button>
              ))}
            </div>
          )}

          {/* وصف */}
          <p style={{ color: "#aaa", marginTop: "10px" }}>
            قطعة أنيقة تضيف لمسة فخمة لإطلالتك ✨
          </p>

          {/* 🔥 زر السلة (معدل فقط) */}
          {isSoldOut ? (
            <button
              style={{
                marginTop: "25px",
                padding: "12px 30px",
                borderRadius: "12px",
                border: "none",
                background: "gray",
                color: "white",
                cursor: "not-allowed",
              }}
            >
              Sold Out ❌
            </button>
          ) : (
            <button
              onClick={() => {
                if (product.sizes && !selectedSize) {
                  alert("اختر المقاس أولاً ⚠️");
                  return;
                }

                addToCart({ ...product, selectedSize });
                navigate("/cart");
              }}
              style={{
                marginTop: "25px",
                padding: "12px 30px",
                borderRadius: "12px",
                border: "none",
                background: "#D4AF37",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              أضف للسلة 🛒
            </button>
          )}

          {/* رجوع */}
          <button
            onClick={() => navigate("/shop")}
            style={{
              marginTop: "15px",
              marginRight: "10px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid #444",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            الرجوع للتسوق
          </button>
        </div>
      </div>
    </div>
  );
}

export default Product;