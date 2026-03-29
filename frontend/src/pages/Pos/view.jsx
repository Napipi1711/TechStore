import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ← import toast
import Cart from "./components/Cart";
import Search from "./components/Search";
import Category from "./components/Category";
import Product from "./components/Product";
import { getPosProductsApi, getCategoriesApi, checkoutPosApi } from "../../api/posApi";

export default function Pos() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Fetch sản phẩm
  const fetchProducts = async (categoryId = null) => {
    const params = { page: 1, limit: 40 };
    if (categoryId) params.category = categoryId;
    try {
      const res = await getPosProductsApi(params);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      toast.error("Lấy sản phẩm thất bại!");
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Lưu giỏ hàng vào session
  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Lấy danh mục thất bại!");
      }
    };
    fetchCategories();
  }, []);

  const addToCart = (product) => {
    if (product.stock === 0) {
      toast.warn("Sản phẩm này đã hết hàng!");
      return;
    }
    setCartItems((prev) => {
      const exist = prev.find((item) => item._id === product._id);
      if (exist) {
        if (exist.quantity >= product.stock) {
          toast.warn("Không đủ hàng trong kho!");
          return prev;
        }
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Thanh toán
  const handleCheckout = async (method, customerId) => {
    if (cartItems.length === 0) {
      toast.warn("Giỏ hàng đang trống!");
      return;
    }
    if (!customerId) {
      toast.warn("Vui lòng chọn khách hàng trước khi thanh toán!");
      return;
    }
    try {
      const items = cartItems.map((item) => ({
        productId: item._id,
        qty: item.quantity,
        price: item.price,
        costPrice: item.costPrice || 0,
      }));

      const res = await checkoutPosApi({
        paymentMethod: method,
        customerId,
        items,
      });

      if (res.data.paymentMethod === "qr") {
        navigate("/pos/qr-payment", {
          state: { qr: res.data.qr, saleId: res.data.saleId }
        });
      } else {
        toast.success("Thanh toán thành công!");

        navigate(`/invoices/invoice/${res.data.saleId}`, {
          state: {
            saleId: res.data.saleId,
            total: res.data.total,
            paymentMethod: res.data.paymentMethod
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán thất bại!");
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-black p-4 gap-6 overflow-hidden">

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col border border-gray-100 rounded-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <Search addToCart={addToCart} />
        </div>

        <Category
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          fetchProducts={fetchProducts}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 overflow-y-auto flex-1 bg-white">
          {products.map((product) => (
            <Product key={product._id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Cart */}
      <div className="w-[400px] flex flex-col border border-gray-100 rounded-sm overflow-hidden bg-white">
        <Cart
          cartItems={cartItems}
          setCartItems={setCartItems}
          handleCheckout={handleCheckout}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
        />
      </div>
    </div>
  );
}