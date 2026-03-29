import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js";
import mongoose from "mongoose";

export const getInvoiceById = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({ message: "Invalid saleId" });
        }

        const sale = await Sale.findById(saleId)
            .populate("customerId", "name phone address")
            .populate("branchId", "name address phone")
            .populate("staffId", "name phone email")
            .lean();

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        const details = await SaleDetail.find({ saleId })
            .populate("productId", "name price")
            .lean();

        //  FORMAT LUÔN
        const products = details.map(d => ({
            name: d.productId?.name,
            quantity: d.quantity,
            price: d.price,
            total: d.lineTotal
        }));

        const total =
            (sale.totalCostAmount || 0) +
            (sale.totalProfitAmount || 0);

        res.json({
            success: true,

            saleId: sale._id,
            saleCode: sale.saleCode,
            paymentMethod: sale.paymentMethod,
            status: sale.status,
            createdAt: sale.createdAt,
            paidAt: sale.paidAt,

            customer: sale.customerId,
            staff: sale.staffId,
            branch: sale.branchId,

            products,
            total
        });

    } catch (error) {
        console.error("GET INVOICE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};