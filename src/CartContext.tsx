import { createContext, useState, useEffect } from "react";

export const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // 🔥 حفظ السلة
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const existing = cart.find(
      (item) =>
        item.id === product.id &&
        item.selectedSize === product.selectedSize
    );

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // 🔥 تقليل الكمية
  const decreaseQuantity = (id: string, selectedSize?: string) => {
    setCart(
      cart
        .map((item) =>
          item.id === id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 🔥 حذف عنصر
  const removeFromCart = (id: string, selectedSize?: string) => {
    setCart(
      cart.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === selectedSize
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}