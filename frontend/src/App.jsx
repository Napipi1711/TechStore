
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import NotFound from "./utils/NotFound";
import InvoicePage from "./pages/Pos/components/InvoicePage.jsx";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import ViewHistory from "./pages/Pos/viewHistory";
import Sidebar from "./components/Sidebar/Sidebar";
import Settings from "./components/Settings/Settings";
import CustomerList from "./pages/Customer/index.jsx";
import CustomerPurchases from "./pages/Customer/CustomerPurchases.jsx";
import Pos from "./pages/Pos/view";
import Payment from "./pages/Pos/Payment/Payment";
import ConfirmPayment from "./pages/Pos/Payment/ConfirmPayment";

import Inventory from "./pages/Inventories";
import Details from "./pages/Inventories/Details";
import SalesDetails from "./pages/Inventories/salesDetails";
import Purchase from "./pages/purchases/Purchases";
import CreatePurchase from "./pages/purchases/CreatePurchase";
import EditPurchase from "./pages/purchases/EditPurchase";
import PurchaseDetail from "./pages/purchases/PurchaseDetail";
import RevenueIndex from "./pages/Revenue/index";
import ActivityIndex from "./pages/Activity/ActivityIndex";
import ActivityDetail from "./pages/Activity/ActivityDetail";
import QRPayment from "./pages/Pos/Payment/viewQr/QRPayment";
import ListStaff from "./pages/ListStaff/index.jsx";
import Detailstaff from "./pages/ListStaff/Details.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; //toast 

/* ================= Layout ================= */
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-app-bg">
    <Sidebar />
    <div className="flex-1 min-w-0 overflow-x-hidden p-6">
      {children}
    </div>
  </div>
);

/* ================= Private Route ================= */
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { token, loading } = useAuth();

  if (loading) return <div>Loading auth...</div>;

  return (
    <>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/pos" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/pos" replace />}
        />

        <Route
          path="/forgot-password"
          element={!token ? <ForgotPassword /> : <Navigate to="/pos" replace />}
        />

        <Route
          path="/reset-password/:token"
          element={!token ? <ResetPassword /> : <Navigate to="/pos" replace />}
        />
        <Route
          path="/revenue"
          element={
            <PrivateRoute>
              <Layout>
                <RevenueIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ================= DASHBOARD ================= */}

        <Route
          path="/pos"
          element={
            <PrivateRoute>
              <Layout>
                <Pos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pos/history"
          element={
            <PrivateRoute>
              <Layout>
                <ViewHistory />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <Layout>
                <Payment />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/pos/qr-payment" element={<QRPayment />} />
        <Route
          path="/confirmpayment"
          element={
            <PrivateRoute>
              <Layout>
                <ConfirmPayment />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/invoice/:saleId"
          element={
            <PrivateRoute>
              <Layout>
                <InvoicePage />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* INVENTORY */}
        <Route
          path="/inventories"
          element={
            <PrivateRoute>
              <Layout>
                <Inventory />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/inventories/:productId"
          element={
            <PrivateRoute>
              <Layout>
                <Details />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/sales/product/:productId" element={<SalesDetails />} />
        {/* PURCHASE */}
        <Route
          path="/purchases"
          element={
            <PrivateRoute>
              <Layout>
                <Purchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreatePurchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/:id/edit"
          element={
            <PrivateRoute>
              <Layout>
                <EditPurchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/:id"
          element={
            <PrivateRoute>
              <Layout>
                <PurchaseDetail />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* ACTIVITY */}
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <Layout>
                <ActivityIndex />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/activity/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ActivityDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* CUSTOMER */}
        <Route
          path="/customer"
          element={
            <PrivateRoute>
              <Layout>
                <CustomerList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/:id/purchases"
          element={
            <PrivateRoute>
              <Layout>
                <CustomerPurchases />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <Layout>
                <ListStaff />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/:id"
          element={
            <PrivateRoute>
              <Layout>
                <Detailstaff />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}
