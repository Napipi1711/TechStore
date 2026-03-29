import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NotFound from "../ultis/NotFound.jsx";
import SideBar from "./components/SideBar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login.jsx";
import Setting from "./components/Settings/setting.jsx";
/* BRANCH PAGES */
import BranchIndex from "./pages/Branches/index.jsx";
import BranchCreate from "./pages/Branches/create.jsx";
import BranchUpdate from "./pages/Branches/update.jsx";
import BranchView from "./pages/Branches/view.jsx";
import BranchDelete from "./pages/Branches/delete.jsx";

/* ACCOUNT PAGES */
import AccountList from "./pages/Accounts/index";
import CreateAccount from "./pages/Accounts/create";
import UpdateAccount from "./pages/Accounts/update";
import ViewAccount from "./pages/Accounts/view";

/* CATEGORY PAGES */
import CategoryIndex from "./pages/categories/index.jsx";
import CategoryCreate from "./pages/categories/create.jsx";
import CategoryUpdate from "./pages/categories/update.jsx";
import CategoryView from "./pages/categories/view.jsx";

/* PRODUCT PAGES */
import ProductIndex from "./pages/Products/index.jsx";
import ProductCreate from "./pages/Products/create.jsx";
import ProductUpdate from "./pages/Products/update.jsx";
import ProductView from "./pages/Products/view.jsx";

/* BRAND PAGES */
import BrandIndex from "./pages/Brands/index.jsx";
import BrandCreate from "./pages/Brands/create.jsx";
import BrandUpdate from "./pages/Brands/update.jsx";
import BrandView from "./pages/Brands/view.jsx";

/* ACTIVITY */
import ActivityIndex from "./pages/Activitys/index.jsx";
import StaffLogs from "./pages/Activitys/StaffLogs.jsx";
import Details from "./pages/Activitys/details.jsx";

/* SUPPLIER PAGES */
import SupplierIndex from "./pages/Suppliers/index.jsx";
import SupplierCreate from "./pages/Suppliers/create.jsx";
import SupplierUpdate from "./pages/Suppliers/update.jsx";
import SupplierView from "./pages/Suppliers/view.jsx";
/* INVENTORY PAGES */
import InventoryIndex from "./pages/Inventories/index.jsx";
/* USER BRANCH */
import BranchPersonnelUpdate from "./pages/User/update.jsx";
/* DashBoard */
import Dashboard from "./pages/views";
/* ================= Layout ================= */
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <SideBar />
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="min-h-screen bg-white p-4 lg:p-8">
        {children}
      </main>
    </div>
  </div>
);

/* ================= Private Route ================= */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* ===== ROOT ===== */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/accounts" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ===== LOGIN ===== */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/accounts" replace />
            )
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        {/* ACCOUNT */}
        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <Layout>
                <AccountList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <PrivateRoute>
              <Layout>
                <AccountList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accounts/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreateAccount />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accounts/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <UpdateAccount />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accounts/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ViewAccount />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* CATEGORY */}
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Layout>
                <CategoryIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/create"
          element={
            <PrivateRoute>
              <Layout>
                <CategoryCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CategoryUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CategoryView />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* PRODUCT */}
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Layout>
                <ProductIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <PrivateRoute>
              <Layout>
                <ProductCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ProductUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ProductView />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* BRANCH */}
        <Route
          path="/branches"
          element={
            <PrivateRoute>
              <Layout>
                <BranchIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches/create"
          element={
            <PrivateRoute>
              <Layout>
                <BranchCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BranchUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BranchView />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches/delete/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BranchDelete />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches/:id/personnel"
          element={
            <PrivateRoute>
              <Layout>
                <BranchPersonnelUpdate />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* BRAND */}
        <Route
          path="/brands"
          element={
            <PrivateRoute>
              <Layout>
                <BrandIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/brands/create"
          element={
            <PrivateRoute>
              <Layout>
                <BrandCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/brands/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BrandUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/brands/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BrandView />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* SUPPLIERS */}
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <Layout>
                <SupplierIndex />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers/create"
          element={
            <PrivateRoute>
              <Layout>
                <SupplierCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <SupplierUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers/view/:id"
          element={
            <PrivateRoute>
              <Layout>
                <SupplierView />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* INVENTORIES */}
        <Route
          path="/inventories"
          element={
            <PrivateRoute>
              <Layout>
                <InventoryIndex />
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
          path="/activity/staff/:staffId"
          element={
            <PrivateRoute>
              <Layout>
                <StaffLogs />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/activity/staff/:staffId/details"
          element={
            <PrivateRoute>
              <Layout>
                <Details />
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
                <Setting />
              </Layout>
            </PrivateRoute>
          }
        />
        {/*  DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ===== 404 ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;