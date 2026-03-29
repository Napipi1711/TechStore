import { useState, useEffect, useRef } from "react";
import searchApi from "../../../api/searchApi";
import { Search as SearchIcon, Loader2, PackageX, X, ScanBarcode, CircleAlert } from "lucide-react";

export default function Search({ addToCart }) {
    const [keyword, setKeyword] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Logic mới cho Popup quét mã
    const [showScanPopup, setShowScanPopup] = useState(false);

    const dropdownRef = useRef(null);

    // click ngoài dropdown -> đóng
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // search debounce
    useEffect(() => {
        if (!keyword.trim()) {
            setProducts([]);
            setIsOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchApi.searchInventory(keyword);
                const data = res.data || [];
                const formatted = data.map((p) => ({
                    ...p,
                    _id: p.productId
                }));
                setProducts(formatted);
                setIsOpen(true);
            } catch (err) {
                console.error("Search error:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    return (
        <div className="flex items-center gap-2 w-full max-w-xl relative" ref={dropdownRef}>

            <div className="relative flex-grow">
                {/* INPUT */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                        type="text"
                        placeholder="Tìm sản phẩm, SKU..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="w-full pl-10 pr-10 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    {/* clear / loading */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            keyword && (
                                <button
                                    onClick={() => {
                                        setKeyword("");
                                        setProducts([]);
                                        setIsOpen(false);
                                    }}
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* DROPDOWN KẾT QUẢ */}
                {isOpen && keyword && (
                    <div className="absolute w-full bg-white border mt-2 rounded-xl shadow-xl max-h-[420px] overflow-y-auto z-50">
                        {loading && products.length === 0 && (
                            <div className="p-6 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                                <p className="text-sm text-gray-500">Đang tìm...</p>
                            </div>
                        )}

                        {!loading && products.length === 0 && (
                            <div className="p-6 text-center">
                                <PackageX className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Không tìm thấy sản phẩm</p>
                            </div>
                        )}

                        {products.length > 0 && (
                            <div>
                                <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold bg-gray-50">
                                    Sản phẩm ({products.length})
                                </div>
                                {products.map((p) => (
                                    <div
                                        key={p._id}
                                        onClick={() => {
                                            addToCart(p);
                                            setKeyword("");
                                            setProducts([]);
                                            setIsOpen(false);
                                        }}
                                        className="flex justify-between items-center px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-700">{p.name}</div>
                                            <div className="text-xs text-gray-400">{p.sku}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">
                                                ${p.price.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-blue-500 font-semibold">
                                                Kho: {p.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* NÚT QUÉT MÃ */}
            <button
                onClick={() => setShowScanPopup(true)}
                className="flex items-center justify-center p-2.5 bg-gray-900 hover:bg-black text-white rounded-full transition-all active:scale-95 shadow-md"
            >
                <ScanBarcode className="h-6 w-6" />
            </button>

            {/* POPUP QUÉT MÃ (Thay thế window.alert) */}
            {showScanPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ScanBarcode className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">Sẵn sàng quét</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Vui lòng sử dụng máy quét mã vạch và nhắm vào mã SKU của sản phẩm.
                            </p>

                            <button
                                onClick={() => setShowScanPopup(false)}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}