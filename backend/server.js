import dotenv from "dotenv";
dotenv.config();

import express from "express";
// import { Socket } from "socket.io";


import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Import
import brandRoutes from "./routes/admin/brandRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/admin/accountRoutes.js";
import branchRoutes from "./routes/admin/BranchRoutes.js";
import categoryRoutes from "./routes/admin/categoryRoutes.js";
import productRoutes from "./routes/admin/productRoutes.js";
import userBranchRoutes from "./routes/admin/userBranchRoutes.js"
import auditLogRoutes from "./routes/admin/activityRoutes.js"
import supplierRoutes from "./routes/admin/supplierRoutes.js";
import inventoryRoutes from "./routes/admin/inventoriesRoutes.js";
import dashboardRoutes from "./routes/admin/dashboardRoutes.js"
//staff
import getInvoiceById from "./routes/staff/invoiceRoutes.js";
import posRoutes from "./routes/staff/posRoutes.js";
import customerRoutes from "./routes/staff/viewcustomerRoutes.js"
//manager
import purchaseRoutes from "./routes/staff/purchaseRoutes.js";
import staffSupplierRoutes from "./routes/staff/supplierRoutes.js";
import viewBranchRoutes from "./routes/staff/viewBranch.js";
import viewProductRoutes from "./routes/staff/productRoutes.js";
import staffinventoryRoutes from "./routes/staff/inventoriesRoutes.js";
import frontendActivityRoutes from "./routes/staff/activityRoutes.js";
import revenueRoutes from "./routes/staff/revenueRoutes.js";
import staffRoutes from "./routes/staff/listStaff.js"
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Database
connectDB();

//  Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use("/public", express.static(path.join(__dirname, "public")));

//  Routes 

app.use("/api/admin/branches", branchRoutes);
app.use("/api/admin/accounts", accountRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/user-branches", userBranchRoutes);
app.use("/api/admin/audit-logs", auditLogRoutes);
app.use("/api/admin/suppliers", supplierRoutes);
app.use("/api/admin/inventories", inventoryRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
// staff
app.use("/api/staff/pos", posRoutes);
app.use("/api/staff/viewcustomer", customerRoutes);
app.use("/api/staff/invoices", getInvoiceById);
// manager
app.use("/api/manager/purchases", purchaseRoutes);
app.use("/api/manager/suppliers", staffSupplierRoutes);
app.use("/api/manager/branch", viewBranchRoutes);
app.use("/api/manager/product", viewProductRoutes);
app.use("/api/manager/activity-logs", frontendActivityRoutes);
app.use("/api/manager/dashboard", revenueRoutes);
app.use("/api/manager/staff", staffRoutes);
// manager and staff ( view for us)
app.use("/api/inventories", staffinventoryRoutes); 
//all
app.use("/api/users", userRoutes);
// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Đường dẫn (Route) không tồn tại" });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});