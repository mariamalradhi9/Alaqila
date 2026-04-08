import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Routes, Route, useNavigate } from "react-router-dom";
import Product from "./Product";
import Cart from "./Cart";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import Checkout from "./Checkout";
import Admin from "./Admin";

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const { cart } = useContext(CartContext);

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

  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          alaqila store
        </h2>

        <div
          style={{ cursor: "pointer", fontSize: "18px" }}
          onClick={() => navigate("/cart")}
        >
          🛒 ({cart.length})
        </div>
      </div>
      <Routes>
        {/* 🏠 الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{ width: "200px", cursor: "pointer" }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                  <h3>{product.name}</h3>
                  <p>{product.price} BD</p>
                </div>
              ))}
            </div>
          }
        />

        {/* 📦 صفحة المنتج */}
        <Route path="/product/:id" element={<Product />} />

        {/* 🛒 صفحة السلة */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;