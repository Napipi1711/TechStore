import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Box, ShoppingCart, Info } from "lucide-react";
import productApi from "../../api/productApi";

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await productApi.getById(id);
                setProduct(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="p-20 text-center animate-pulse">
                Đang tải...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-20 text-center text-red-500 font-bold">
                Không tìm thấy sản phẩm!
            </div>
        );
    }

    const images = product.images || [];

    const mainImage =
        images.length > 0
            ? images[0]
            : "https://placehold.co/600x600?text=No+Image";

    return (
        <div className="max-w-6xl">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">

                <button
                    onClick={() => navigate("/products")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium"
                >
                    <ArrowLeft size={20} />
                    Quay lại
                </button>

                <Link
                    to={`/products/update/${product._id}`}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm"
                >
                    <Pencil size={18} />
                    Chỉnh sửa
                </Link>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* IMAGE */}
                <div className="space-y-4">

                    <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.slice(1).map((img, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                                >
                                    <img
                                        src={img}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* INFO */}
                <div className="space-y-8">

                    {/* TITLE */}
                    <div>

                        <div className="flex gap-2 flex-wrap">

                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {product.categoryId?.name || "Category"}
                            </span>

                            {product.brandId && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    {product.brandId?.name}
                                </span>
                            )}

                        </div>

                        <h1 className="text-4xl font-black text-slate-900 mt-4 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-light text-slate-900 mt-2">
                            {Number(product.price || 0).toLocaleString()} $
                        </p>

                    </div>



                    {/* DESCRIPTION */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                            <Info size={16} />
                            Mô tả sản phẩm
                        </h3>

                        <p className="text-slate-600 leading-relaxed italic">
                            {product.description || "Không có mô tả chi tiết."}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProductView;