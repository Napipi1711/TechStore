export default function Category({
    categories,
    activeCategory,
    setActiveCategory,
    fetchProducts
}) {
    return (
        <div className="flex gap-2 px-4 py-3 border-b overflow-x-auto">

            <button
                onClick={() => {
                    setActiveCategory(null);
                    fetchProducts();
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium
        ${activeCategory === null
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
            >
                Tất cả
            </button>

            {categories.map((cat) => (
                <button
                    key={cat._id}
                    onClick={() => {
                        setActiveCategory(cat._id);
                        fetchProducts(cat._id);
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-medium
          ${activeCategory === cat._id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {cat.name}
                </button>
            ))}

        </div>
    );
}