import logo from "./assets/Logo.jpeg";
import { useEffect, useState, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Product from "./Product";
import Cart from "./Cart";
import { CartContext } from "./CartContext";
import Checkout from "./Checkout";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";
import TrackOrder from "./TrackOrder";

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [adminUser, setAdminUser] = useState<any>(undefined); // undefined = loading
  const { cart } = useContext(CartContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const getProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { getProducts(); }, []);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setAdminUser(user));
    return unsub;
  }, []);

  const showNavbar = location.pathname !== "/";
  const isAdminRoute = location.pathname.startsWith("/manage-store-aqeela");

  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => category === "all" ? true : p.category === category);

  // ── Admin route: protected ──────────────────────────────────────────────
  if (isAdminRoute) {
    if (adminUser === undefined) return <div style={{ color: "#D4AF37", textAlign: "center", marginTop: "100px" }}>جاري التحقق...</div>;
    return adminUser ? <Admin /> : <AdminLogin />;
  }

  return (
    <div style={{ background: "#0B0F1A", minHeight: "100vh", direction: "rtl" }}>
      {/* Navbar */}
      {showNavbar && (
        <nav style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px", borderBottom: "1px solid #1a1a1a",
          background: "#0d1020", position: "sticky", top: 0, zIndex: 100,
        }}>
          <img src={logo} onClick={() => navigate("/")} style={{ height: "60px", cursor: "pointer" }} alt="logo" />
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              placeholder="ابحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "white", width: "clamp(100px,20vw,200px)", fontSize: "14px" }}
            />
            <button onClick={() => navigate("/track")}
              style={{ background: "transparent", border: "1px solid #333", color: "#aaa", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}>
              📦 تتبع طلب
            </button>
            <div onClick={() => navigate("/cart")}
              style={{ background: "#D4AF37", color: "#000", padding: "9px 14px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "14px", position: "relative" }}>
              🛒 {cart.length > 0 && <span style={{ background: "#000", color: "#D4AF37", borderRadius: "50%", padding: "1px 5px", fontSize: "11px", marginRight: "4px" }}>{cart.length}</span>}
            </div>
          </div>
        </nav>
      )}

      <Routes>
        {/* Home */}
        <Route path="/" element={
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <img src={logo} style={{ height: "160px", marginBottom: "20px" }} alt="logo" />
            <h1 style={{ color: "#D4AF37", fontSize: "clamp(24px,5vw,40px)", marginBottom: "12px" }}>مرحباً بك في العقيلة</h1>
            <p style={{ color: "#888", marginBottom: "30px", fontSize: "15px" }}>أفخم الخواتم والإكسسوارات المختارة بعناية</p>
            <button onClick={() => navigate("/shop")}
              style={{ padding: "14px 44px", background: "#D4AF37", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
              تسوق الآن ✨
            </button>
          </div>
        } />

        {/* Shop */}
        <Route path="/shop" element={
          <div style={{ padding: "24px 16px" }}>
            {/* Categories */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              {[["all","الكل"],["rings","خواتم"],["necklace","سلاسل"],["bracelet","أساور"]].map(([cat,label]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ padding: "9px 18px", borderRadius: "25px", border: "1px solid #333", background: category===cat?"#D4AF37":"transparent", color: category===cat?"#000":"#ccc", fontWeight: "bold", cursor: "pointer", fontSize: "13px", transition: "0.2s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
              {filteredProducts.length === 0
                ? <h2 style={{ color: "#D4AF37", gridColumn: "1/-1", textAlign: "center" }}>لا يوجد منتجات 😢</h2>
                : filteredProducts.map(product => {
                  const soldOut = product.sizes
                    ? Object.values(product.sizes).every((q:any) => Number(q)===0)
                    : Number(product.quantity??0)===0;
                  const stockNum = product.sizes
                    ? Object.values(product.sizes).reduce((s:number,q:any)=>s+Number(q),0)
                    : Number(product.quantity??0);
                  const lowStock = !soldOut && stockNum<=3;

                  return (
                    <div key={product.id} onClick={() => navigate(`/product/${product.id}`)}
                      style={{ position:"relative", borderRadius:"14px", overflow:"hidden", background:"#111", border:"1px solid #222", cursor:"pointer", transition:"all 0.25s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 10px 28px rgba(212,175,55,0.25)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}>

                      {/* Badges */}
                      {soldOut && (
                        <div style={{ position:"absolute",top:"8px",left:"8px",background:"#ef4444",color:"white",padding:"3px 9px",borderRadius:"6px",fontSize:"11px",fontWeight:"bold",zIndex:1 }}>
                          Sold Out
                        </div>
                      )}
                      {lowStock && (
                        <div style={{ position:"absolute",top:"8px",left:"8px",background:"#f59e0b",color:"#000",padding:"3px 9px",borderRadius:"6px",fontSize:"11px",fontWeight:"bold",zIndex:1 }}>
                          ⚠️ باقي {stockNum}
                        </div>
                      )}

                      {/* Media */}
                      {product.video ? (
                        <video src={product.video} autoPlay loop muted playsInline style={{ width:"100%",height:"200px",objectFit:"cover" }} />
                      ) : (
                        <img src={product.image} style={{ width:"100%",height:"200px",objectFit:"cover",transition:"0.3s" }} alt={product.name} />
                      )}

                      <div style={{ padding: "12px" }}>
                        <h3 style={{ color:"#D4AF37",margin:"0 0 4px",fontSize:"14px" }}>{product.name}</h3>
                        <p style={{ color:"#ccc",margin:0,fontSize:"13px" }}>{product.price} BD</p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        } />

        <Route path="/product/:id"              element={<Product />} />
        <Route path="/cart"                     element={<Cart />} />
        <Route path="/checkout"                 element={<Checkout />} />
        <Route path="/track"                    element={<TrackOrder />} />
        <Route path="/track/:orderNumber"       element={<TrackOrder />} />
        <Route path="/manage-store-aqeela"      element={<div/>} />
      </Routes>

      {/* WhatsApp floating button */}
      <a href="https://wa.me/97337573375" target="_blank" rel="noreferrer"
        style={{ position:"fixed",bottom:"24px",left:"24px",background:"#25D366",width:"52px",height:"52px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",boxShadow:"0 4px 16px rgba(37,211,102,0.4)",textDecoration:"none",zIndex:200 }}>
        💬
      </a>
    </div>
  );
}

export default App;
