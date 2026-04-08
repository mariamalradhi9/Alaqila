import { createContext, useState } from "react";

export const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCart((prev: any[]) => [...prev, product]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]); // 🔥 تفريغ السلة
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        setCart,   // 👈 مهم
        clearCart, // 👈 أفضل
      }}
    >
      {children}
    </CartContext.Provider>
  );
}