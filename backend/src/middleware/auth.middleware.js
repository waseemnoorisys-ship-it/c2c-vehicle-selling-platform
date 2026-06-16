const jwt     = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User    = require("../models/user/user.model");

// WHY: Every protected route calls this first.
// It verifies the JWT, loads the user, and attaches it to req.usere
//whos the user? user kon hai
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Fetch fresh user (catches deactivated accounts after token issue)
    //juned sir setion
    //if user logged in monday so the token is expired after seven days
    //but
    //but
    //but
    //admin delete or deactivate/block the user so it still has a access for 7 days its bad practice
    //we want if user block and DB save the user Block:true and save so why we are fetching user details from DB with every call on /routes/auth/auth.route.js
    //so we are fetching user details from DB with every call to check if user is blocked or not
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user)          throw new ApiError(401, "User not found");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");
    if (user.deletedAt) throw new ApiError(403, "Account has been deleted");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

//user ko kya allowed hai ? what the user is allowed to do
// RBAC factory — usage: requireRole("vendor") or requireRole("buyer","vendor")
//suppose in future router.poast("/products",authenticate , requiredRole("vendor"),createProduct)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };