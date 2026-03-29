import Customer from "../../models/Customer.js";
import Sale from "../../models/Sale.js"
import SaleDetail from "../../models/SaleDetail.js";
import product from "../../models/Product.js";
export const create = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!phone) return res.status(400).json({ message: "Phone is required" });

        let customer = await Customer.findOne({ phone });

        if (!customer) {
            customer = await Customer.create({ name, phone, email, address });
        }

        return res.status(201).json({ customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Lấy khách hàng theo id
 */
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.status(200).json({ customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) return res.status(400).json({ message: "Phone query is required" });

        const customer = await Customer.findOne({ phone });
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.status(200).json({ customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
export const getAll = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({ customers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllPurchase = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // ===== 1️⃣ Build filter theo ngày =====
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = end;
            }
        }
        console.log("Date filter:", dateFilter);

        // ===== 2️⃣ Lấy tất cả đơn hàng =====
        const sales = await Sale.find(dateFilter)
            .populate("customerId", "name phone email") // thông tin khách
            .sort({ createdAt: -1 });
        console.log("Sales found:", sales.length);

        if (!sales.length) return res.status(200).json({ purchases: [] });

        // ===== 3️⃣ Lấy chi tiết đơn =====
        const saleIds = sales.map(s => s._id);
        const saleDetails = await SaleDetail.find({ saleId: { $in: saleIds } })
            .populate("productId", "name sku price"); // lấy thông tin sản phẩm
        console.log("SaleDetails found:", saleDetails.length);

        // ===== 4️⃣ Gom chi tiết theo đơn + tính lineTotal và totalAmount =====
        const purchases = sales.map(sale => {
            const items = saleDetails
                .filter(d => d.saleId.toString() === sale._id.toString())
                .map(d => {
                    const price = d.price || 0;
                    const quantity = d.quantity || 0;
                    const lineTotal = price * quantity;

                    // debug chi tiết từng item
                    console.log(`Sale ${sale.saleCode} - Product ${d.productId.name}: quantity=${quantity}, price=${price}, lineTotal=${lineTotal}`);

                    return {
                        product: d.productId,
                        quantity,
                        price,
                        lineTotal,
                        costAmount: d.costAmount,
                        profitAmount: d.profitAmount,
                    };
                });

            const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
            console.log(`Sale ${sale.saleCode} - Calculated totalAmount: ${totalAmount}`);

            return {
                ...sale.toObject(),
                items,
                totalAmount,
            };
        });

        res.status(200).json({ purchases });

    } catch (err) {
        console.error("Error in getAllPurchase:", err);
        res.status(500).json({ message: "Server error" });
    }
};