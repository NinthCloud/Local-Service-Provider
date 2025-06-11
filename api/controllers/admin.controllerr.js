import {
  User,
  Provider,
  Service,
  Booking,
  Review,
  Category,
} from "../models/index.js";
import createError from "../utils/createError.js";
import { Op } from "sequelize";

// Fetch users who applied to become providers
export const getPendingProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 providers per page
    const offset = (page - 1) * limit;

    // Fetch paginated pending provider applications
    const { rows: pendingUsers, count: totalProviders } =
      await User.findAndCountAll({
        where: {
          appliedForProvider: true,
          approvedByAdmin: false,
        },
        attributes: { exclude: ["password"] },
        offset,
        limit,
      });

    res.status(200).json({
      providers: pendingUsers,
      totalPages: Math.ceil(totalProviders / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const filter = {
      isSeller: true,
      appliedForProvider: true,
      approvedByAdmin: true,
    };

    const { rows: providers, count: totalProviders } =
      await User.findAndCountAll({
        where: filter,
        attributes: { exclude: ["password"] },
        offset,
        limit,
      });

    const totalPages = Math.ceil(totalProviders / limit);

    res.status(200).json({
      providers: providers || [],
      totalProviders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Approve provider application
// export const approveProvider = async (req, res, next) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findByPk(userId);
//     if (!user) return next(createError(404, "User not found"));

//     if (!user.appliedForProvider)
//       return next(
//         createError(400, "User has not applied to become a provider")
//       );

//     await user.update({
//       approvedByAdmin: true,
//       isSeller: true,
//     });

//     res.status(200).json({ message: "Provider approved successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

export const approveProvider = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) return next(createError(404, "User not found"));
    
    if (!user.appliedForProvider)
      return next(
        createError(400, "User has not applied to become a provider")
      );
    
    // Check if a provider record already exists for this user
    let provider = await Provider.findOne({ where: { userId } });
    
    // If no provider record exists, create one
    if (!provider) {
      provider = await Provider.create({
        userId,
        // Add any default provider fields here
      });
      //console.log("Created new provider with ID:", provider.id);
    } else {
      //console.log("Using existing provider with ID:", provider.id);
    }
    
    // Update the services to be listed again if they were unlisted
    if (provider) {
      await Service.update(
        { isUnlisted: false },
        { where: { providerId: provider.id } }
      );
    }
    
    await user.update({
      approvedByAdmin: true,
      isSeller: true,
    });
    
    res.status(200).json({ 
      message: "Provider approved successfully",
      providerId: provider.id // Send provider ID back to the client
    });
  } catch (error) {
    next(error);
  }
};

// Reject provider application
export const rejectProvider = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return next(createError(404, "User not found"));

    if (!user.appliedForProvider)
      return next(
        createError(400, "User has not applied to become a provider")
      );

    await user.update({
      appliedForProvider: false,
      approvedByAdmin: false,
      isSeller: false,
    });

    // // Remove provider data if exists
    // await Provider.destroy({
    //   where: { userId: user.id },
    // });

    res.status(200).json({ message: "Provider application rejected" });
  } catch (error) {
    next(error);
  }
};

// Revoke provider
export const revokeProvider = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) return next(createError(404, "User not found"));

    if (!user.appliedForProvider)
      return next(
        createError(400, "User has not applied to become a provider")
      );

    // Find the provider associated with this user
    const provider = await Provider.findOne({ where: { userId } });
    if (provider) {
      // Find all services linked to this provider
      const services = await Service.findAll({
        where: { providerId: provider.id }
      });

      // Update all services to be unlisted
      if (services.length > 0) {
        await Promise.all(
          services.map(service => 
            service.update({ isUnlisted: true })
          )
        );
      }
    }

    // Update user status
    await user.update({
      approvedByAdmin: false,
      // isSeller: false // Also revoking seller status since they're no longer approved
    });

    res.status(200).json({ 
      message: "Provider status revoked and all associated services unlisted",
      affectedServices: provider ? await Service.count({ where: { providerId: provider.id } }) : 0
    });
  } catch (error) {
    next(error);
  }
};

// Single provider details
export const getProvider = async (req, res, next) => {
  try {
    // Fetch user details by ID
    const user = await User.findByPk(req.params.id, {
      attributes: [
        "username",
        "fullName",
        "email",
        "image",
        "phone",
        "address",
        "city",
        "pincode",
        "isSeller",
        "appliedForProvider",
        "approvedByAdmin",
        "desc2",
        "createdAt",
      ],
      include: [
        {
          model: Provider,
          as: "provider",
          attributes: [
            "desc",
            "dob",
            "profession",
            "experience",
            "serviceHours",
            "serviceLevel",
            "providerName",
            "providerEmail",
            "providerAddress",
            "providerPhone",
            "verify",
            "createdAt",
          ],
        },
      ],
    });

    if (!user) {
      console.error("User not found:", req.params.id);
      return next(createError(404, "User not found"));
    }

    // If the user is a seller and applied for provider, fetch provider details
    let providerData = null;
    if (user.isSeller && user.appliedForProvider && !user.provider) {
      providerData = await Provider.findOne({
        where: { userId: user.id },
      });
    }

    // Construct the response object
    const userDetails = {
      ...user.get({ plain: true }),
      providerDetails: providerData
        ? providerData.get({ plain: true })
        : user.provider
        ? user.provider.get({ plain: true })
        : null,
    };

    res.status(200).json(userDetails);
  } catch (err) {
    console.error("❌ Error fetching provider details:", err.message);
    next(err);
  }
};

// Function to get all users
export const getUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] },
      offset,
      limit,
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users: users || [],
      totalUsers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegularUsers = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const { rows: regularUsers, count: totalUsers } =
      await User.findAndCountAll({
        where: {
          approvedByAdmin: false,
          role: "user",
        },
        attributes: { exclude: ["password"] },
        offset,
        limit,
      });

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users: regularUsers || [],
      totalUsers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Get user details
export const getUser = async (req, res, next) => {
  try {
    // Fetch user details by ID
    const user = await User.findByPk(req.params.id, {
      attributes: [
        "username",
        "fullName",
        "email",
        "image",
        "phone",
        "address",
        "city",
        "pincode",
        "dob",
        "isSeller",
        "appliedForProvider",
        "provider",
        "status",
        "createdAt",
      ],
      include: [
        {
          model: Provider,
          as: "provider",
          attributes: [
            "desc",
            "dob",
            "profession",
            "experience",
            "serviceHours",
            "serviceLevel",
            "providerName",
            "providerEmail",
            "providerAddress",
            "providerPhone",
            "verify",
            "createdAt",
          ],
        },
      ],
    });

    if (!user) {
      console.error("User not found:", req.params.id);
      return next(createError(404, "User not found"));
    }

    // If the user is a seller and applied for provider, fetch provider details
    let providerData = null;
    if (user.isSeller && user.appliedForProvider && !user.provider) {
      providerData = await Provider.findOne({
        where: { userId: user.id },
      });
    }

    // Construct the response object
    const userDetails = {
      ...user.get({ plain: true }),
      providerDetails: providerData
        ? providerData.get({ plain: true })
        : user.provider
        ? user.provider.get({ plain: true })
        : null,
    };

    res.status(200).json(userDetails);
  } catch (err) {
    console.error("❌ Error fetching provider details:", err.message);
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(createError(404, "User not found"));

    // if (req.userId !== user.id.toString()) {
    //   return next(createError(403, "You can delete only your account"));
    // }

    await User.destroy({
      where: { id: req.params.id },
    });

    // Remove provider data if exists
    await Provider.destroy({
      where: { userId: user.id },
    });

    res.status(200).send("User deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch all orders without filtering by user
    const { rows: orders, count: totalOrders } = await Booking.findAndCountAll({
      offset,
      limit,
    });

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).send("Internal server error");
  }
};

export const getOrder = async (req, res, next) => {
  try {
    // Fetch the booking using the provided bookingId
    const booking = await Booking.findByPk(req.params.bookingId);

    if (!booking) {
      console.error("Booking not found:", req.params.bookingId);
      return next(createError(404, "Booking not found"));
    }

    // Get the provider associated with the logged-in user (if any)
    //const userProvider = await Provider.findOne({ where: { userId: req.userId } });
    
    // Check if the logged-in user is authorized to view the booking
    // User can view if they are the buyer or the provider of the booking
    // const isAuthorized = 
    //   booking.buyerId === req.userId || 
    //   (userProvider && userProvider.id === booking.providerId);
      
    // if (!isAuthorized) {
    //   console.error("Unauthorized access by user:", req.userId);
    //   return next(
    //     createError(403, "You are not authorized to view this booking")
    //   );
    // }

    // Fetch provider details (including user information)
    const provider = await Provider.findByPk(booking.providerId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "image", "fullName", "pincode", "city"]
        }
      ],
      attributes: [
        "desc",
        "profession",
        "experience",
        "serviceHours",
        "serviceLevel",
        "providerName",
        "providerEmail",
        "providerAddress",
        "providerPhone",
      ]
    });

    // Fetch buyer details
    const buyer = await User.findByPk(booking.buyerId, {
      attributes: [
        "username",
        "email",
        "image",
        "address",
        "phone",
        "fullName",
        "pincode",
        "city",
      ],
    });

    if (!provider || !buyer) {
      console.error("Provider or buyer details not found for the booking");
      return next(createError(404, "Provider or buyer details not found"));
    }

    // Attach the fetched user and provider details to the booking response
    const bookingWithDetails = {
      ...booking.toJSON(),
      providerDetails: provider,
      buyerDetails: buyer,
      sellerDetails: provider.user // For backward compatibility
    };

    res.status(200).json(bookingWithDetails);
  } catch (err) {
    console.error("Error in getOrder controller:", err.message);
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch all reviews with pagination
    const { rows: reviews, count: totalReviews } = await Review.findAndCountAll(
      {
        offset,
        limit,
      }
    );

    res.status(200).json({
      reviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    await Review.destroy({
      where: { id: reviewId },
    });

    // Update gig rating after review deletion
    await Gig.increment(
      { totalStars: -review.star, starNumber: -1 },
      { where: { id: review.gigId } }
    );

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  try {
    const q = req.query;
    const search = q.search?.toLowerCase().trim() || "";
    const locationQuery = q.location?.trim() || "";
    const minPrice = parseInt(q.min, 10) || 0;
    const maxPrice = parseInt(q.max, 10) || Number.MAX_VALUE;

    // Default where clause
    let whereClause = { isDeleted: false };

    // Handle location filtering
    if (locationQuery) {
      const normalizedLocationQuery = locationQuery.toLowerCase().trim();

      whereClause = {
        ...whereClause,
        [Op.or]: [
          { locationA: { [Op.contains]: [normalizedLocationQuery] } }, // For array fields
          { locationB: { [Op.contains]: [normalizedLocationQuery] } }, // For array fields
        ],
      };
    }

    // Extract price from the search term
    const priceRegex = /(\bunder\b|\bbelow\b|\brs\b|₹|less than)\s*(\d+)/i;
    const priceMatch = search.match(priceRegex);

    if (priceMatch) {
      const maxSearchPrice = parseInt(priceMatch[2], 10);
      whereClause.price = { [Op.lte]: maxSearchPrice };
    } else {
      // Add regular price filter
      whereClause.price = { [Op.between]: [minPrice, maxPrice] };
    }

    // Clean search term and prepare for search
    const cleanedSearchTerm = search
      .replace(priceRegex, "")
      .replace(/\b(under|below|rs|₹|less than)\b/gi, "")
      .replace(/\b(in|at|near|around)\b/gi, "")
      .trim();

    if (cleanedSearchTerm) {
      // Convert search terms to tsquery format
      const searchTerms = cleanedSearchTerm
        .split(/\s+/)
        .filter((k) => k.length > 0)
        .map((term) => term + ":*") // Add prefix matching
        .join(" & ");

      if (searchTerms) {
        // Use the search_vector column with PostgreSQL full-text search
        whereClause = {
          ...whereClause,
          [Op.and]: [
            whereClause,
            sequelize.literal(
              `search_vector @@ to_tsquery('english', '${searchTerms.replace(
                /'/g,
                "''"
              )}')`
            ),
          ],
        };
      }
    }

    // Add user and category filters if provided
    if (q.userId) whereClause.userId = q.userId;
    if (q.cat) whereClause.cat = q.cat;

    // Enhanced sorting logic
    let order = [];

    switch (q.sort) {
      case "sales":
        order.push(["sales", "DESC"]);
        break;
      case "createdAt":
      case "recent":
        order.push(["createdAt", "DESC"]);
        break;
      case "HighestRated":
        order.push(["totalStars", "DESC"], ["starNumber", "DESC"]);
        break;
      case "priceAsc":
        order.push(["price", "ASC"]);
        break;
      case "priceDesc":
        order.push(["price", "DESC"]);
        break;
      case "mostReviews":
        order.push(["starNumber", "DESC"]);
        break;
      default:
        order.push(["createdAt", "DESC"]); // Default to newest
    }

    // Add relevance-based sorting for search results
    if (cleanedSearchTerm) {
      const searchTerms = cleanedSearchTerm
        .split(/\s+/)
        .filter((k) => k.length > 0)
        .map((term) => term + ":*")
        .join(" & ");

      if (searchTerms) {
        // Add relevance ranking to sort results
        order.unshift([
          sequelize.literal(
            `ts_rank(search_vector, to_tsquery('english', '${searchTerms.replace(
              /'/g,
              "''"
            )}')`
          ),
          "DESC",
        ]);
      }
    }

    // Pagination logic
    const page = parseInt(q.page, 10) || 1;
    const limit = parseInt(q.limit, 10) || 6;
    const offset = (page - 1) * limit;

    // Fetch services with pagination
    const { rows: services, count: totalServices } =
      await Service.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        distinct: true,
      });

    // Return response with pagination data
    res.status(200).json({
      services,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      totalServices,
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) next(createError(404, "Service not found!"));
    res.status(200).send(service);
  } catch (err) {
    next(err);
  }
};

// Delete a service
export const deleteGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) return next(createError(404, "Gig not found"));

    // if (gig.userId !== req.userId) {
    //   return next(createError(403, "You can only update your own gig"));
    // }

    await service.update({
      isDeleted: !service.isDeleted, // Toggle the status
    });

    res.status(200).json({
      message: `Service ${service.isDeleted ? "deleted" : ""} successfully`,
      service: service.get({ plain: true }),
    });
  } catch (err) {
    next(err);
  }
};

// function to handle category
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, cover } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    
    // Create new category with cover image if provided
    const newCategory = await Category.create({
      name,
      description,
      cover, // Add cover image URL
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, cover } = req.body; // Add cover to destructuring
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Check if the new name already exists in another category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }
    
    // Update category with cover image
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive,
      cover: cover !== undefined ? cover : category.cover, // Update cover image URL
    });
    
    // If name changed, update all services using this category
    if (name && name !== category.name) {
      await Service.update({ cat: name }, { where: { categoryId: id } });
    }
    
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are services using this category
    const serviceCount = await Service.count({
      where: { categoryId: id },
    });

    if (serviceCount > 0) {
      // Just mark as inactive instead of deleting
      await category.update({ isActive: false });
      return res.status(200).json({
        message: "Category marked as inactive as it is being used by services",
        category,
      });
    }

    // If no services use this category, we can safely delete it
    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
