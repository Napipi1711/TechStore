const isAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can access this resource" });
  }
  next();
};

export default isAdminMiddleware;
