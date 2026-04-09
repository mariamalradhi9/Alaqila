import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./CartContext";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./Toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ToastProvider>
  </BrowserRouter>
);
