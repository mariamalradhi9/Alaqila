import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price,
    0
  );

  return (
    <div style={{ padding: "40px", marginTop: "20px" }}>
      <h1 style={{ marginBottom: "30px", fontWeight: "bold" }}>
        🛒 Your Cart
      </h1>

      {cart.length === 0 ? (
        <p style={{ fontSize: "18px" }}>السلة فاضية 😢</p>
      ) : (
        <>
          {cart.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "20px",
                alignItems: "center",
                background: "#f9f9f9",
                padding: "15px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <p style={{ margin: "5px 0", color: "gray" }}>
                  {item.price} BD
                </p>
              </div>

              <button
                onClick={() => removeFromCart(index)}
                style={{
                  background: "#ff4d4f",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.3s",
                }}
              >
                حذف ❌
              </button>
            </div>
          ))}

          {/* المجموع */}
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <h2>المجموع: {total} BD 💰</h2>

            <button
              onClick={() => navigate("/checkout")}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                background: "black",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              إتمام الطلب 💳
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;