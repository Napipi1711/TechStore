import User from "../../models/User.js";
import UserBranch from "../../models/UserBranches.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../ultis/cloudinary.js";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js";
export const lists = async (req, res) => {
    try {
        const { search } = req.query;
        const managerBranchId = req.user.branchId;

        if (!managerBranchId) {
            return res.status(400).json({ message: "Branches context is missing" });
        }

        const userBranches = await UserBranch.find({ branchId: managerBranchId })
            .populate("userId", "-password")
            .populate("branchId", "name address")
            .lean();

        let users = userBranches
            .map(ub => ({
                ...ub.userId,
                roleInBranch: ub.role,
            }))
            .filter(u =>
                u.role !== "admin" &&
                u._id.toString() !== req.user.id.toString()
            );

        if (search) {
            const regex = new RegExp(search, "i");
            users = users.filter(u => regex.test(u.name) || regex.test(u.email));
        }

        const branches = userBranches
            .filter(ub => users.find(u => u._id.toString() === ub.userId._id.toString()))
            .map(ub => ({
                userId: ub.userId._id,
                branch: ub.branchId,
                role: ub.role
            }));

        const branchMap = {};
        branches.forEach(b => {
            if (!branchMap[b.userId]) branchMap[b.userId] = [];
            branchMap[b.userId].push({
                branch: b.branch,
                role: b.role
            });
        });

        const result = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            avatar: u.avatar,
            roleInBranch: u.roleInBranch,
            branches: branchMap[u._id] || []
        }));

        res.json({ total: result.length, users: result });

    } catch (err) {
        console.error("LIST STAFF ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};
export const getSaleStatus = async (req, res) => {
    try {
        const { staffId, startDate, endDate } = req.query;
        const managerBranchId = req.user.branchId;

        if (!managerBranchId) {
            return res.status(400).json({ message: "Branch context missing" });
        }

        if (!mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({ message: "Invalid staffId" });
        }

        //  build filter
        const filter = {
            staffId,
            branchId: managerBranchId,
            status: "paid",
        };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                // Để endDate bao gồm cả ngày đó
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const sales = await Sale.find(filter)
            .populate("customerId", "name phone")
            .populate("staffId", "name")
            .select("_id saleCode createdAt customerId")
            .sort({ createdAt: -1 }) // mới nhất lên đầu
            .lean();

        if (!sales.length) {
            return res.json({
                success: true,
                totalOrders: 0,
                totalRevenue: 0,
                totalProfit: 0,
                orders: [],
            });
        }

        const saleMap = new Map();
        sales.forEach(s => saleMap.set(s._id.toString(), s));

        const saleIds = sales.map(s => s._id);

        //  lấy chi tiết đơn
        const saleDetails = await SaleDetail.find({
            saleId: { $in: saleIds },
        })
            .populate("productId", "name")
            .lean();

        let totalRevenue = 0;
        let totalProfit = 0;

        const orderMap = new Map();

        //  build orders
        saleDetails.forEach(d => {
            const sale = saleMap.get(d.saleId.toString());
            if (!sale) return;

            const saleId = sale._id.toString();

            if (!orderMap.has(saleId)) {
                orderMap.set(saleId, {
                    saleId: sale._id,
                    saleCode: sale.saleCode,
                    date: sale.createdAt,
                    customer: sale.customerId,
                    staff: sale.staffId,
                    items: [],
                    total: 0,
                });
            }

            const order = orderMap.get(saleId);

            order.items.push({
                productName: d.productId?.name || "Unknown",
                quantity: d.quantity,
                price: d.price,
                total: d.lineTotal,
            });

            order.total += d.lineTotal || 0;

            totalRevenue += d.lineTotal || 0;
            totalProfit += d.profitAmount || 0;
        });

        return res.json({
            success: true,
            totalOrders: sales.length,
            totalRevenue,
            totalProfit,
            orders: Array.from(orderMap.values())
                .sort((a, b) => new Date(b.date) - new Date(a.date)),
        });

    } catch (error) {
        console.error("GET SALE STATUS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};