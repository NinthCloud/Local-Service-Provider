import createError from "../utils/createError.js";
import {User} from "../models/index.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId); // Use findByPk instead of findById

    if (!user || user.role !== "admin") {
      return next(createError(403, "Access denied. Admins only."));
    }

    next();
  } catch (error) {
    next(error);
  }
};
