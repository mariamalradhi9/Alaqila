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

  const getOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
    getOrders();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ marginBottom: "30px" }}>📦 الطلبات</h1>

      {orders.length === 0 ? (
        <p style={{ fontSize: "18px" }}>ما في طلبات حالياً 😴</p>
      ) : (
        orders.map((order) => {
          // 🔥 دعم القديم + الجديد
          const customer = order.customer || {
            name: order.name,
            phone: order.phone,
            address: order.address,
          };

          const items = order.items || order.cart || [];

          return (
            <div
              key={order.id}
              style={{
                marginBottom: "20px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#fafafa",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* 👤 بيانات العميل */}
              <h3>👤 {customer?.name || "—"}</h3>
              <p>📞 {customer?.phone || "—"}</p>
              <p>📍 {customer?.address || "—"}</p>

              <p>💰 {order.total || 0} BD</p>

              {/* 🟢 حالة الطلب */}
              <p>
                الحالة:{" "}
                <strong
                  style={{
                    color: order.status === "done" ? "green" : "orange",
                  }}
                >
                  {order.status === "done" ? "تم التوصيل" : "جديد"}
                </strong>
              </p>

              <h4 style={{ marginTop: "15px" }}>🛒 المنتجات:</h4>

              {items.length === 0 ? (
                <p>لا توجد منتجات</p>
              ) : (
                items.map((item: any, i: number) => (
                  <div key={i} style={{ marginLeft: "10px" }}>
                    🛍 {item.name} - {item.price} BD
                  </div>
                ))
              )}

              {/* أزرار التحكم */}
              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => markAsDone(order.id)}
                  style={{
                    background: "green",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  تم التوصيل ✅
                </button>

                <button
                  onClick={() => deleteOrder(order.id)}
                  style={{
                    background: "#ff4d4f",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  حذف ❌
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Admin;