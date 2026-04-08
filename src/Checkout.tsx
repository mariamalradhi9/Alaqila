import { useState, useContext } from "react";
import { CartContext } from "./CartContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price,
    0
  );

  const handleOrder = async () => {
    if (!name || !phone || !address) {
      alert("عبي كل البيانات ⚠️");
      return;
    }

    try {
      // 🔥 تخزين الطلب بشكل احترافي
      await addDoc(collection(db, "orders"), {
        customer: {
          name,
          phone,
          address,
        },
        items: cart,
        total,
        status: "new", // 👈 جديد
        createdAt: serverTimestamp(), // 👈 وقت دقيق
      });

      // 🧹 تنظيف السلة
      clearCart();

      alert("تم إرسال الطلب بنجاح 🎉");

    } catch (error) {
      console.error(error);
      alert("صار خطأ 😢");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <h1 style={{ marginBottom: "30px" }}>💳 صفحة الدفع</h1>

      <input
        placeholder="الاسم"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="العنوان"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={inputStyle}
      />

      <h2 style={{ marginBottom: "20px" }}>
        المجموع: {total} BD 💰
      </h2>

      <button onClick={handleOrder} style={buttonStyle}>
        تأكيد الطلب 🚀
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
};

export default Checkout;