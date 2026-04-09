import { useState, useContext } from "react";
import { CartContext } from "./CartContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum: number, item: any) =>
      sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  const handleOrder = async () => {
    if (!name || !phone || !address) {
      alert("عبي كل البيانات ⚠️");
      return;
    }

    try {
      setLoading(true);

      // 🔥 التحقق من الكمية
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) continue;

        const data: any = productSnap.data() || {};

        const size =
          typeof item.selectedSize === "string"
            ? item.selectedSize
            : null;

        // ✅ منتجات المقاسات
        if (
          data.sizes &&
          size &&
          typeof data.sizes === "object" &&
          data.sizes[size] !== undefined
        ) {
          if ((data.sizes[size] || 0) < (item.quantity || 0)) {
            alert(`المنتج ${item.name} غير متوفر ❌`);
            setLoading(false);
            return;
          }
        } else {
          // ✅ منتجات عادية
          if ((data.quantity || 0) < (item.quantity || 0)) {
            alert(`المنتج ${item.name} غير متوفر ❌`);
            setLoading(false);
            return;
          }
        }
      }

      // 🔥 حفظ الطلب
      await addDoc(collection(db, "orders"), {
        customer: { name, phone, address },
        items: cart,
        total,
        status: "new",
        createdAt: serverTimestamp(),
      });

      // 🔥 تقليل الكمية
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data: any = productSnap.data() || {};

          const size =
            typeof item.selectedSize === "string"
              ? item.selectedSize
              : null;

          if (
            data.sizes &&
            size &&
            typeof data.sizes === "object" &&
            data.sizes[size] !== undefined
          ) {
            await updateDoc(productRef, {
              sizes: {
                ...data.sizes,
                [size]:
                  (data.sizes[size] || 0) - (item.quantity || 0),
              },
            });
          } else {
            await updateDoc(productRef, {
              quantity:
                (data.quantity || 0) - (item.quantity || 0),
            });
          }
        }
      }

      clearCart();
      alert("تم إرسال الطلب بنجاح 🎉");

      setName("");
      setPhone("");
      setAddress("");

    } catch (error) {
      console.error(error);
      alert("صار خطأ 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "auto",
        color: "white",
      }}
    >
      <h1
        style={{
          marginBottom: "20px",
          color: "#D4AF37",
          textAlign: "center",
        }}
      >
        🧾 إتمام الطلب
      </h1>

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

      <h2
        style={{
          marginBottom: "20px",
          color: "#D4AF37",
          textAlign: "center",
        }}
      >
        المجموع: {total} BD 💰
      </h2>

      <button
        onClick={handleOrder}
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "جارٍ الإرسال..." : "تأكيد الطلب 🚀"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#111",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#D4AF37",
  color: "#000",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default Checkout;