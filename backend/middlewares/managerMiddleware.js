const isManagerMiddleware = (req, res, next) => {
    console.log("User branchRole:", req.user.branchRole);
    console.log("Type:", typeof req.user.branchRole);

    if (!req.user.branchId) {
        return res.status(400).json({ message: "Branches context is missing" });
    }

    if (req.user.branchRole !== "branch_manager") {
        return res.status(403).json({
            message: "Only branch manager can access this resource",
        });
    }

    next();
};

export default isManagerMiddleware;