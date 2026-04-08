import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Product() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const navigate = useNavigate();

    const { addToCart } = useContext(CartContext); // ✅ هنا الصح

    const getProduct = async () => {
        if (!id) return;

        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProduct(docSnap.data());
        }
    };

    useEffect(() => {
        getProduct();
    }, [id]);

    if (!product) return <h2>Loading...</h2>;

    return (
        <div
            style={{
                padding: "40px",
                display: "flex",
                gap: "40px",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src={product.image}
                alt={product.name}
                style={{
                    width: "350px",
                    borderRadius: "15px",
                }}
            />

            <div>
                <h1>{product.name}</h1>
                <h2 style={{ color: "gray" }}>{product.price} BD</h2>

                <button
                    onClick={() => {
                        addToCart(product);
                        navigate("/cart");
                    }}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        border: "none",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Add to Cart 🛒
                </button>
            </div>
        </div>
    );
}

export default Product;