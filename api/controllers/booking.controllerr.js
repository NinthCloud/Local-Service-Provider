import createError from "../utils/createError.js";
import { Op } from "sequelize";
import { User, Provider, Service, Booking, Review } from "../models/index.js";

/**
 * Create a new booking for a service
 */
export const createOrder = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.serviceId);
    if (!service) return next(createError(404, "Service not found"));

    const { email, preferredDate, preferredTime, notes } = req.body;

    // Find the service's availability for the requested date
    // Assuming availability is stored as a JSON column in Service model
    const availability = service.availability || [];
    const dateAvailability = availability.find((a) => a.date === preferredDate);
    if (!dateAvailability)
      return next(createError(400, "No availability for the selected date"));

    // Check if the requested time slot is available
    const slot = dateAvailability.slots.find(
      (s) => s.time === preferredTime && !s.isBooked
    );
    if (!slot)
      return next(createError(400, "Selected time slot is already booked"));

    // Mark the slot as booked
    slot.isBooked = true;

    // Update the availability in the database
    await Service.update({ availability }, { where: { id: service.id } });

    // Create the booking with providerId instead of sellerId
    const newBooking = await Booking.create({
      serviceId: service.id,
      img: service.cover,
      title: service.title,
      email,
      preferredDate,
      preferredTime,
      notes,
      buyerId: req.userId,
      providerId: service.providerId, // Use providerId instead of sellerId
      price: service.price,
      status: "Pending",
    });

    res.status(200).send("Booking created successfully!");
  } catch (err) {
    next(err);
  }
};

/**
 * Get bookings for the logged-in user
 * - If the user is a provider, fetch bookings where they are the provider
 * - If the user is a buyer, fetch bookings where they are the buyer
 */
// export const getOrders = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 bookings per page
//     const offset = (page - 1) * limit;

//     // Check if the user is a provider
//     const provider = await Provider.findOne({ where: { userId: req.userId } });
    
//     let filter = {};
    
//     if (provider) {
//       // If user is a provider, get bookings by providerId
//       filter = {
//         where: {
//           [Op.or]: [
//             { buyerId: req.userId }, 
//             { providerId: provider.id }
//           ]
//         },
//         offset,
//         limit,
//       };
//     } else {
//       // If user is only a buyer, get bookings by buyerId
//       filter = {
//         where: { buyerId: req.userId },
//         offset,
//         limit,
//       };
//     }

//     // Get paginated bookings
//     const { count, rows } = await Booking.findAndCountAll(filter);

//     res.status(200).json({
//       bookings: rows,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//     });
//   } catch (err) {
//     console.error("Error fetching bookings:", err.message);
//     res.status(500).send("Internal server error");
//   }
// };

export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const showProviderOrders = req.query.showProviderOrders === 'true';
    const userId = req.userId;

    // Check if the user is a provider
    const provider = await Provider.findOne({ where: { userId: userId } });
    
    let filter = {};
    
    if (provider && showProviderOrders) {
      // If user is a provider and wants to see provider orders
      filter = {
        where: { providerId: provider.id },
        offset,
        limit,
      };
    } else {
      // If user wants to see buyer orders
      filter = {
        where: { buyerId: userId },
        offset,
        limit,
      };
    }

    // Get paginated bookings
    const { count, rows } = await Booking.findAndCountAll(filter);

    res.status(200).json({
      bookings: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err.message);
    res.status(500).send("Internal server error");
  }
};

/**
 * Confirm a booking
 * - Only the provider related to that specific service can confirm a booking
 */
export const confirmOrder = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return next(createError(404, "Booking not found"));

    // Fetch the service associated with the booking
    const service = await Service.findByPk(booking.serviceId);
    if (!service) return next(createError(404, "Service not found"));

    // Get the provider associated with the logged-in user
    const provider = await Provider.findOne({ where: { userId: req.userId } });
    if (!provider) return next(createError(403, "Only providers can confirm bookings"));

    // Ensure only the actual service provider can confirm the booking
    if (service.providerId !== provider.id) {
      return next(
        createError(403, "Only the service provider can confirm this booking")
      );
    }

    // Update booking status to Confirmed
    await booking.update({ status: "Confirmed" });

    // Increment sales in the service
    await service.increment("sales");

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a booking
 * - Both the buyer and the provider can cancel the booking
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return next(createError(404, "Booking not found"));

    // Check if user is the provider of this booking
    const provider = await Provider.findOne({ where: { userId: req.userId } });
    const isProvider = provider && provider.id === booking.providerId;
    
    // User can cancel if they are the buyer or the provider of the booking
    if (booking.buyerId !== req.userId && !isProvider) {
      return next(createError(403, "Not authorized to cancel this booking"));
    }

    // Find the service and update its availability
    const service = await Service.findByPk(booking.serviceId);
    if (service) {
      const availability = service.availability || [];
      const dateAvailability = availability.find(
        (a) => a.date === booking.preferredDate
      );
      if (dateAvailability) {
        const slot = dateAvailability.slots.find(
          (s) => s.time === booking.preferredTime
        );
        if (slot) {
          slot.isBooked = false; // Free the slot
        }
      }

      // Update the service with modified availability
      await service.update({ availability });
    }

    // Mark booking as canceled
    await booking.update({ status: "Canceled" });

    res.status(200).send(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Get details of a specific booking
 * - Both the buyer and the provider can view the booking details
 */
export const getOrder = async (req, res, next) => {
  try {
    // Fetch the booking using the provided bookingId
    const booking = await Booking.findByPk(req.params.bookingId);

    if (!booking) {
      console.error("Booking not found:", req.params.bookingId);
      return next(createError(404, "Booking not found"));
    }

    // Get the provider associated with the logged-in user (if any)
    const userProvider = await Provider.findOne({ where: { userId: req.userId } });
    
    // Check if the logged-in user is authorized to view the booking
    // User can view if they are the buyer or the provider of the booking
    const isAuthorized = 
      booking.buyerId === req.userId || 
      (userProvider && userProvider.id === booking.providerId);
      
    if (!isAuthorized) {
      console.error("Unauthorized access by user:", req.userId);
      return next(
        createError(403, "You are not authorized to view this booking")
      );
    }

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

/**
 * Check if the logged-in user has booked a specific service
 * - Returns { confirmed: true } if a booking is confirmed
 */
export const checkOrderStatus = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // Find a booking for the given service where the logged-in user is the buyer
    const booking = await Booking.findOne({
      where: {
        serviceId,
        buyerId: req.userId,
      },
    });

    if (!booking) {
      return res.status(200).json({ booked: false, confirmed: false });
    }

    res.status(200).json({
      booked: true,
      confirmed: booking.status === "Confirmed",
      actualStatus: booking.status,
    });
  } catch (err) {
    next(err);
  }
};

// This is just the new function to add to your existing booking controller
export const checkReviewableStatus = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const userId = req.userId;
    
    // Find all confirmed bookings for this user and service
    const confirmedBookings = await Booking.findAll({
      where: {
        serviceId,
        buyerId: userId,
        status: "Confirmed",
      },
    });
    
    if (confirmedBookings.length === 0) {
      return res.status(200).json({ 
        canReview: false, 
        message: "No confirmed bookings found" 
      });
    }
    
    // Check if any of these bookings haven't been reviewed yet
    const bookingIds = confirmedBookings.map(booking => booking.id);
    
    const reviews = await Review.findAll({
      where: {
        bookingId: {
          [Op.in]: bookingIds
        }
      }
    });
    
    // Create a map of reviewed booking IDs for quick lookup
    const reviewedBookingIds = reviews.map(review => review.bookingId);
    
    // Find bookings that have not been reviewed
    const unreviewedBookings = confirmedBookings.filter(
      booking => !reviewedBookingIds.includes(booking.id)
    );
    
    res.status(200).json({ 
      canReview: unreviewedBookings.length > 0,
      reviewableBookings: unreviewedBookings.map(booking => ({
        id: booking.id,
        date: booking.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};