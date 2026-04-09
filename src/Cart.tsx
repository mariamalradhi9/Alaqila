import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

function Cart() {
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2 style={{ color: "#D4AF37" }}>السلة فاضية 🛒</h2>

        <button
          onClick={() => navigate("/shop")}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            background: "#D4AF37",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          الرجوع للتسوق
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", color: "white" }}>
      {cart.map((item: any, index: number) => (
        <div
          key={index} // 🔥 مهم (بدل id)
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
            background: "#111",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #222",
          }}
        >
          <img
            src={item.image}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />

          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#D4AF37", margin: 0 }}>
              {item.name}
            </h3>

            {item.selectedSize && (
              <p style={{ color: "#aaa" }}>
                المقاس: {item.selectedSize}
              </p>
            )}

            <p style={{ color: "#ccc", margin: "5px 0" }}>
              {item.price} BD
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => addToCart(item)}
                style={{
                  background: "#D4AF37",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                +
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() =>
                  decreaseQuantity(item.id, item.selectedSize) // 🔥 مهم
                }
                style={{
                  background: "#D4AF37",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                -
              </button>
            </div>
          </div>

          <button
            onClick={() =>
              removeFromCart(item.id, item.selectedSize) // 🔥 مهم
            }
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "8px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <h2
        style={{
          marginTop: "30px",
          color: "#D4AF37",
          textAlign: "center",
        }}
      >
        المجموع: {total} BD
      </h2>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={() => navigate("/shop")}
          style={{
            padding: "12px 30px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          متابعة التسوق 🛍️
        </button>

        <button
          onClick={() => navigate("/checkout")}
          style={{
            padding: "12px 30px",
            background: "#D4AF37",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🧾 إتمام الطلب
        </button>
      </div>
    </div>
  );
}

export default Cart;