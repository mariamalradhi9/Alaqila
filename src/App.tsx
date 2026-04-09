import logo from "./assets/Logo.jpeg";
import { useEffect, useState, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Product from "./Product";
import Cart from "./Cart";
import { CartContext } from "./CartContext";
import Checkout from "./Checkout";
import Admin from "./Admin";

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const showNavbar = location.pathname !== "/";

  const filteredProducts = products
    .filter((product) =>
      product.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product) =>
      category === "all" ? true : product.category === category
    );

  return (
    <div style={{ background: "#0B0F1A", minHeight: "100vh", direction: "rtl" }}>

      {/* 🔝 Navbar */}
      {showNavbar && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "1px solid #222",
          }}
        >
          <img
            src={logo}
            onClick={() => navigate("/")}
            style={{ height: "80px", cursor: "pointer" }}
          />

          <div style={{ display: "flex", gap: "20px" }}>
            <input
              placeholder="ابحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #333",
                background: "#111",
                color: "white",
              }}
            />

            <div
              onClick={() => navigate("/cart")}
              style={{
                background: "#D4AF37",
                color: "#000",
                padding: "10px 14px",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🛒 ({cart.length})
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <img src={logo} style={{ height: "180px" }} />

              <h1 style={{ color: "#D4AF37" }}>
                مرحباً بك في العقيلة
              </h1>

              <p style={{ color: "#aaa" }}>
                أفخم الخواتم والإكسسوارات المختارة بعناية
              </p>

              <button
                onClick={() => navigate("/shop")}
                style={{
                  marginTop: "30px",
                  padding: "14px 40px",
                  background: "#D4AF37",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                تسوق الآن
              </button>
            </div>
          }
        />

        {/* 🛍️ المنتجات */}
        <Route
          path="/shop"
          element={
            <div style={{ padding: "40px" }}>

              {/* 🔥 التصنيفات */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginBottom: "30px",
                }}
              >
                {["all", "rings", "necklace", "bracelet"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "25px",
                      border: "1px solid #444",
                      background:
                        category === cat ? "#D4AF37" : "transparent",
                      color: category === cat ? "#000" : "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onMouseEnter={(e) => {
                      if (category !== cat)
                        e.currentTarget.style.background = "#333";
                    }}
                    onMouseLeave={(e) => {
                      if (category !== cat)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {cat === "all"
                      ? "الكل"
                      : cat === "rings"
                        ? "خواتم"
                        : cat === "necklace"
                          ? "سلاسل"
                          : "أساور"}
                  </button>
                ))}
              </div>

              {/* المنتجات */}
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {filteredProducts.length === 0 ? (
                  <h2 style={{ color: "#D4AF37" }}>
                    لا يوجد منتجات 😢
                  </h2>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() =>
                        navigate(`/product/${product.id}`)
                      }
                      style={{
                        position: "relative",
                        width: "220px",
                        borderRadius: "15px",
                        overflow: "hidden",
                        background: "#111",
                        border: "1px solid #222",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-8px) scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 30px rgba(212, 175, 55, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* 🔥 بادج Sold Out */}
                      {(product.sizes
                        ? Object.values(product.sizes).every((q: any) => Number(q) === 0)
                        : Number(product.quantity ?? 0) === 0) && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "red",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            zIndex: 1,
                          }}
                        >
                          Sold Out
                        </div>
                      )}
                      {/* 🔥 صورة أو فيديو في الشبكة */}
                      {product.video ? (
                        <video
                          src={product.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            width: "100%",
                            height: "220px",
                            objectFit: "cover",
                            transition: "0.3s",
                          }}
                        />
                      ) : (
                        <img
                          src={product.image}
                          style={{
                            width: "100%",
                            height: "220px",
                            objectFit: "cover",
                            transition: "0.3s",
                          }}
                        />
                      )}

                      <div style={{ padding: "12px" }}>
                        <h3 style={{ color: "#D4AF37" }}>
                          {product.name}
                        </h3>
                        <p style={{ color: "#ccc" }}>
                          {product.price} BD
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          }
        />

        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;