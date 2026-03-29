// import express from "express";
// import {
//   create,
//   getAll,
//   getById,
//   update,
//   deleteUnit,
// } from "../../controllers/admin/unitController.js";

// import authMiddleware from "../../middlewares/authMiddleware.js";
// import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

// const router = express.Router();

// /**
//  * 🔐 Admin only
//  */
// router.use(authMiddleware, isAdminMiddleware);

// /**
//  * 📌 CRUD Units
//  */
// router.get("/", getAll);        // GET /api/admin/units
// router.get("/:id", getById);    // GET /api/admin/units/:id
// router.post("/", create);       // POST /api/admin/units
// router.put("/:id", update);     // PUT /api/admin/units/:id
// router.delete("/:id", deleteUnit); // DELETE (soft)

// /**
//  * export
//  */
// export default router;