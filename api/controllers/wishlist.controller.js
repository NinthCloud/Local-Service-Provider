// import { Op } from 'sequelize';
// import { Service, User, Wishlist, Provider } from "../models/index.js";
// import createError from "../utils/createError.js";

// export const addToWishlist = async (req, res, next) => {
//   try {
//     const serviceId = req.params.id;
//     const userId = req.userId;

//     // Check if service exists
//     const service = await Service.findByPk(serviceId);
//     if (!service) {
//       return next(createError(404, "Service not found"));
//     }

//     // Check if wishlist entry already exists
//     const existingWishlist = await Wishlist.findOne({
//       where: {
//         userId,
//         serviceId
//       }
//     });

//     let action;
//     if (!existingWishlist) {
//       // Add to wishlist
//       await Wishlist.create({
//         userId,
//         serviceId
//       });
//       action = "added";
//     } else {
//       // Remove from wishlist
//       await existingWishlist.destroy();
//       action = "removed";
//     }

//     // Get updated wishlist IDs
//     const wishlistItems = await Wishlist.findAll({
//       where: { userId },
//       attributes: ['serviceId']
//     });
    
//     const wishlist = wishlistItems.map(item => item.serviceId);

//     res.status(200).json({ 
//       message: `Service ${action} to wishlist`, 
//       wishlist 
//     });
//   } catch (err) {
//     console.error("Wishlist error:", err);
//     next(err);
//   }
// };

// export const getWishlist = async (req, res, next) => {
//   try {
//     const userId = req.userId;

//     // Pagination
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 5;
//     const offset = (page - 1) * limit;

//     // First, get the wishlist service IDs for this user
//     const wishlistItems = await Wishlist.findAll({
//       where: { userId },
//       attributes: ['serviceId']
//     });
    
//     const serviceIds = wishlistItems.map(item => item.serviceId);
    
//     // If no wishlist items, return empty response
//     if (serviceIds.length === 0) {
//       return res.status(200).json({
//         services: [],
//         totalPages: 0,
//         currentPage: page,
//         totalServices: 0,
//       });
//     }
    
//     // Now get the services with pagination
//     const { count, rows: services } = await Service.findAndCountAll({
//       where: {
//         id: serviceIds.length > 0 ? { [Op.in]: serviceIds } : null
//       },
//       include: [
//         {
//           model: Provider,
//           as: 'provider',
//           include: [
//             {
//               model: User,
//               as: 'user',
//               attributes: ['id', 'username', 'image']
//             }
//           ]
//         }
//       ],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       services,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//       totalServices: count,
//     });
//   } catch (err) {
//     console.error("Get wishlist error:", err);
//     next(err);
//   }
// };

// export const removeFromWishlist = async (req, res, next) => {
//   try {
//     const serviceId = req.params.id;
//     const userId = req.userId;

//     // Find the wishlist entry
//     const wishlistItem = await Wishlist.findOne({
//       where: { 
//         userId,
//         serviceId
//       }
//     });

//     if (!wishlistItem) {
//       return next(createError(404, "Item not in wishlist"));
//     }

//     // Remove from wishlist
//     await wishlistItem.destroy();

//     // Get updated wishlist
//     const wishlistItems = await Wishlist.findAll({
//       where: { userId },
//       attributes: ['serviceId']
//     });
    
//     const wishlist = wishlistItems.map(item => item.serviceId);

//     res.status(200).json({ 
//       message: "Service removed from wishlist", 
//       wishlist 
//     });
//   } catch (err) {
//     console.error("Remove from wishlist error:", err);
//     next(err);
//   }
// };

// export const checkWishlistStatus = async (req, res, next) => {
//   try {
//     const serviceId = req.params.id;
//     const userId = req.userId;

//     // Find if the service is in user's wishlist
//     const wishlistItem = await Wishlist.findOne({
//       where: {
//         userId,
//         serviceId
//       }
//     });

//     res.status(200).json({ 
//       isWishlisted: !!wishlistItem
//     });
//   } catch (err) {
//     console.error("Check wishlist status error:", err);
//     next(err);
//   }
// };


import { Op } from 'sequelize';
import { Service, User, Provider } from "../models/index.js";
import createError from "../utils/createError.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.userId;

    // console.log('=== DEBUG: Add to Wishlist ===');
    // console.log('Service ID:', serviceId, 'Type:', typeof serviceId);
    // console.log('User ID:', userId, 'Type:', typeof userId);

    // Check if service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      //console.log('Service not found:', serviceId);
      return next(createError(404, "Service not found"));
    }
   // console.log('Service found:', service.title);

    // Get user with current wishlist
    const user = await User.findByPk(userId);
    if (!user) {
      //console.log('User not found:', userId);
      return next(createError(404, "User not found"));
    }

    // console.log('User found:', user.username);
    // console.log('Current wishlistServices BEFORE:', user.wishlistServices);
    // console.log('Current wishlistServices type:', typeof user.wishlistServices);
    // console.log('Is array?', Array.isArray(user.wishlistServices));

    // Initialize wishlistServices if it's null/undefined
    if (!user.wishlistServices) {
      //console.log('Initializing empty wishlistServices array');
      user.wishlistServices = [];
    }

    // Check if service is already in wishlist
    const isInWishlist = user.wishlistServices.includes(serviceId);
    //console.log('Is service in wishlist?', isInWishlist);
    
    let action;
    if (!isInWishlist) {
      // Add to wishlist - Manual approach instead of using instance method
      //console.log('Adding service to wishlist...');
      user.wishlistServices.push(serviceId);
      user.changed('wishlistServices', true); // Mark field as changed
      await user.save();
      action = "added";
      //console.log('Service added. New wishlist:', user.wishlistServices);
    } else {
      // Remove from wishlist - Manual approach
      //console.log('Removing service from wishlist...');
      user.wishlistServices = user.wishlistServices.filter(id => id !== serviceId);
      user.changed('wishlistServices', true); // Mark field as changed
      await user.save();
      action = "removed";
      //console.log('Service removed. New wishlist:', user.wishlistServices);
    }

    // Reload user to verify changes were saved
    await user.reload();
    //console.log('After reload - wishlistServices:', user.wishlistServices);

    res.status(200).json({ 
      message: `Service ${action} ${action === 'added' ? 'to' : 'from'} wishlist`, 
      wishlist: user.wishlistServices || [],
      debug: {
        serviceId,
        userId,
        action,
        beforeReload: user.wishlistServices
      }
    });
  } catch (err) {
    console.error("Wishlist error:", err);
    console.error("Error stack:", err.stack);
    next(err);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.userId;

    // console.log('=== DEBUG: Get Wishlist ===');
    // console.log('User ID:', userId);

    // Get user with wishlist
    const user = await User.findByPk(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    //console.log('User wishlistServices:', user.wishlistServices);
    const serviceIds = user.wishlistServices || [];
    
    // If no wishlist items, return empty response
    if (serviceIds.length === 0) {
      //console.log('No wishlist items found');
      return res.status(200).json({
        services: [],
        totalPages: 0,
        currentPage: parseInt(req.query.page, 10) || 1,
        totalServices: 0,
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;
    
    //console.log('Fetching services for IDs:', serviceIds);
    
    // Get the services with pagination
    const { count, rows: services } = await Service.findAndCountAll({
      where: {
        id: { [Op.in]: serviceIds },
        isDeleted: false,
        isUnlisted: false
      },
      include: [
        {
          model: Provider,
          as: 'provider',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'image', 'fullName']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    //console.log('Found services:', services.length);

    res.status(200).json({
      services,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalServices: count,
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.userId;

    // console.log('=== DEBUG: Remove from Wishlist ===');
    // console.log('Service ID:', serviceId, 'User ID:', userId);

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    //console.log('Current wishlist before removal:', user.wishlistServices);

    // Initialize if null
    if (!user.wishlistServices) {
      user.wishlistServices = [];
    }

    // Check if service is in wishlist
    if (!user.wishlistServices.includes(serviceId)) {
      return next(createError(404, "Item not in wishlist"));
    }

    // Remove from wishlist
    user.wishlistServices = user.wishlistServices.filter(id => id !== serviceId);
    user.changed('wishlistServices', true);
    await user.save();

    //console.log('Wishlist after removal:', user.wishlistServices);

    res.status(200).json({ 
      message: "Service removed from wishlist", 
      wishlist: user.wishlistServices || []
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    next(err);
  }
};

export const checkWishlistStatus = async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.userId;

    // console.log('=== DEBUG: Check Wishlist Status ===');
    // console.log('Service ID:', serviceId, 'User ID:', userId);

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    //console.log('User wishlistServices:', user.wishlistServices);

    // Check if service is in wishlist
    const isWishlisted = (user.wishlistServices || []).includes(serviceId);
    
    //console.log('Is wishlisted?', isWishlisted);

    res.status(200).json({ 
      isWishlisted
    });
  } catch (err) {
    console.error("Check wishlist status error:", err);
    next(err);
  }
};

// Debug endpoint to check user's wishlist directly
export const debugWishlist = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Raw SQL query to check what's actually in the database
    const [rawResult] = await User.sequelize.query(
      'SELECT "wishlistServices" FROM "Users" WHERE id = :userId',
      {
        replacements: { userId },
        type: User.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json({
      userObject: {
        id: user.id,
        username: user.username,
        wishlistServices: user.wishlistServices
      },
      rawDbResult: rawResult,
      dataTypes: {
        wishlistServicesType: typeof user.wishlistServices,
        isArray: Array.isArray(user.wishlistServices)
      }
    });
  } catch (err) {
    console.error("Debug wishlist error:", err);
    next(err);
  }
};