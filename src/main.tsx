import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./CartContext";
import { BrowserRouter } from "react-router-dom"; // 👈 مهم

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>   {/* 👈 هذا الحل */}
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);