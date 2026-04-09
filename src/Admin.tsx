import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function Admin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "1234";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
    } else {
      alert("كلمة المرور غلط ❌");
    }
  };

  const getOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const markAsDone = async (id: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: "done",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: "done" } : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  useEffect(() => {
    if (isAuth) {
      getOrders();
    }
  }, [isAuth]);

  if (!isAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0B0F1A",
          color: "white",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#111",
            border: "1px solid #222",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 0 25px rgba(212,175,55,0.08)",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#D4AF37", marginBottom: "20px" }}>
            🔐 دخول الأدمن
          </h2>

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#0B0F1A",
              color: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "12px",
              background: "#D4AF37",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        background: "#0B0F1A",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "30px", color: "#D4AF37" }}>📦 الطلبات</h1>

      {orders.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "18px" }}>ما في طلبات حالياً 😴</p>
      ) : (
        orders.map((order) => {
          const customer = order.customer || {
            name: order.name,
            phone: order.phone,
            address: order.address,
          };

          const items = order.items || order.cart || [];
          const mainImage = items.length > 0 ? items[0]?.image : "";

          return (
            <div
              key={order.id}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                marginBottom: "25px",
                background: "#111",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #222",
                boxShadow: "0 0 25px rgba(212,175,55,0.08)",
              }}
            >

              {/* التفاصيل */}
              <div
                style={{
                  flex: 1,
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3 style={{ color: "#D4AF37", marginTop: 0, marginBottom: "10px" }}>
                  👤 {customer?.name || "—"}
                </h3>

                <p style={{ margin: "6px 0", color: "#ddd" }}>
                  📞 {customer?.phone || "—"}
                </p>
                <p style={{ margin: "6px 0", color: "#ddd" }}>
                  📍 {customer?.address || "—"}
                </p>

                <p style={{ margin: "10px 0", color: "#D4AF37", fontWeight: "bold" }}>
                  💰 {order.total || 0} BD
                </p>

                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "10px",
                      background: order.status === "done" ? "green" : "#D4AF37",
                      color: order.status === "done" ? "white" : "black",
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "inline-block",
                    }}
                  >
                    {order.status === "done" ? "تم التوصيل" : "جديد"}
                  </span>
                </div>

                <h4 style={{ marginTop: "10px", marginBottom: "12px", color: "#fff" }}>
                  🛒 المنتجات:
                </h4>

                {items.length === 0 ? (
                  <p style={{ color: "#888" }}>لا توجد منتجات</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {items.map((item: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "#171717",
                          border: "1px solid #222",
                          borderRadius: "12px",
                          padding: "10px",
                        }}
                      >
                        {item.video && item.video !== "" ? (
                          <video
                            src={item.video}
                            style={{
                              width: "58px",
                              height: "58px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              flexShrink: 0,
                            }}
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "58px",
                              height: "58px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <div>
                          <p style={{ margin: 0, color: "white", fontWeight: "bold" }}>
                            {item.name}
                          </p>
                          <p style={{ margin: "4px 0 0", color: "#aaa" }}>
                            {item.price} BD
                          </p>
                          {item.quantity && (
                            <p style={{ margin: "4px 0 0", color: "#888" }}>
                              الكمية: {item.quantity}
                            </p>
                          )}
                          {item.selectedSize && (
                            <p style={{ margin: "4px 0 0", color: "#777" }}>
                              المقاس: {item.selectedSize}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => markAsDone(order.id)}
                    style={{
                      background: "green",
                      color: "white",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    تم التوصيل ✅
                  </button>

                  <button
                    onClick={() => deleteOrder(order.id)}
                    style={{
                      background: "#ff3b30",
                      color: "white",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    حذف ❌
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Admin;