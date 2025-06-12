import createError from "../utils/createError.js";
import { Op } from "sequelize";
import { User, Provider, Service, Booking, Review } from "../models/index.js";
import Stripe from "stripe";



export const intent = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE);
    
    // Find the booking by ID
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['title', 'cover']
        }
      ]
    });
    
    if (!booking) {
      return next(createError(404, "Booking not found"));
    }
    
    // Verify that the user is authorized to make payment for this booking
    if (booking.buyerId !== req.userId) {
      return next(createError(403, "Not authorized to make payment for this booking"));
    }
    
    // Check if booking is in a payable state
    if (booking.status !== 'Confirmed') {
      return next(createError(400, "Booking must be confirmed before payment"));
    }
    
    // Check if payment has already been made
    if (booking.payment_intent) {
      return next(createError(400, "Payment intent already exists for this booking"));
    }
    
    // Create payment intent with booking details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100), // Convert to cents and ensure integer
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id.toString(),
        serviceId: booking.serviceId.toString(),
        buyerId: booking.buyerId.toString(),
        providerId: booking.providerId.toString(),
        serviceTitle: booking.title,
        preferredDate: booking.preferredDate || '',
        preferredTime: booking.preferredTime || ''
      },
      description: `Payment for booking: ${booking.title} on ${booking.preferredDate} at ${booking.preferredTime}`
    });
    
    // Store the payment intent ID in the booking
    await booking.update({ 
      payment_intent: paymentIntent.id,
      // isCompleted: true, 
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: booking.price,
      serviceTitle: booking.title
    });
    
  } catch (err) {
    console.error("Error creating payment intent:", err);
    next(err);
  }
};

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
    // await service.increment("sales");

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { payment_intent } = req.body;
    
    console.log("=== BOOKING CONFIRMATION START ===");
    console.log("Payment Intent from request:", payment_intent);
    console.log("User ID from token:", req.userId);
    
    if (!payment_intent) {
      return next(createError(400, "Payment intent is required"));
    }

    // STRATEGY 1: Direct payment intent match
    let booking = await Booking.findOne({
      where: { 
        payment_intent: payment_intent,
        buyerId: req.userId
      }
    });
    
    console.log("Direct match found:", booking ? "YES" : "NO");
    
    // STRATEGY 2: If no direct match, use Stripe API to get payment intent metadata
    if (!booking) {
      console.log("No direct match, checking Stripe metadata...");
      
      try {
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
        console.log("Stripe Payment Intent metadata:", stripePaymentIntent.metadata);
        
        if (stripePaymentIntent.metadata.bookingId) {
          console.log("Found booking ID in metadata:", stripePaymentIntent.metadata.bookingId);
          
          // Find booking by ID from metadata
          booking = await Booking.findOne({
            where: {
              id: stripePaymentIntent.metadata.bookingId,
              buyerId: req.userId
            }
          });
          
          console.log("Booking found via metadata:", booking ? "YES" : "NO");
          
          // Update the booking with the correct payment intent
          if (booking) {
            console.log("Updating booking with correct payment intent...");
            console.log("Old payment intent:", booking.payment_intent);
            console.log("New payment intent:", payment_intent);
            
            await booking.update({
              payment_intent: payment_intent
            });
            
            console.log("Payment intent updated successfully");
          }
        }
      } catch (stripeError) {
        console.error("Error retrieving from Stripe:", stripeError);
      }
    }
    
    // STRATEGY 3: Find by user's most recent incomplete booking
    if (!booking) {
      console.log("Still no match, trying latest incomplete booking...");
      
      booking = await Booking.findOne({
        where: {
          buyerId: req.userId,
          isCompleted: false
        },
        order: [['createdAt', 'DESC']]
      });
      
      console.log("Latest incomplete booking found:", booking ? "YES" : "NO");
      
      if (booking) {
        console.log("Updating latest incomplete booking with payment intent...");
        await booking.update({
          payment_intent: payment_intent
        });
      }
    }
    
    // FINAL CHECK: Do we have a booking?
    if (!booking) {
      console.log("=== NO BOOKING FOUND - DEBUG INFO ===");
      
      // Show all user's bookings for debugging
      const allUserBookings = await Booking.findAll({
        where: { buyerId: req.userId },
        attributes: ['id', 'payment_intent', 'isCompleted', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      console.log("User's recent bookings:");
      allUserBookings.forEach(b => {
        console.log(`  ID: ${b.id}, PI: ${b.payment_intent}, Completed: ${b.isCompleted}`);
      });
      
      return next(createError(404, "No matching booking found. Please contact support."));
    }
    
    // Check if already completed
    if (booking.isCompleted) {
      console.log("Booking already completed");
      return res.status(200).send("Booking was already confirmed.");
    }
    
    // CONFIRM THE BOOKING
    console.log("Confirming booking ID:", booking.id);
    
    await booking.update({
      isCompleted: true,
      status: 'Confirmed',
      payment_intent: payment_intent // Ensure it's set to the correct one
    });
    
    // Update service sales
    if (booking.serviceId) {
      try {
        await Service.increment('sales', {
          where: { id: booking.serviceId }
        });
        console.log("Service sales incremented");
      } catch (serviceError) {
        console.log("Non-critical error updating service sales:", serviceError.message);
      }
    }
    
    console.log("=== BOOKING CONFIRMATION SUCCESS ===");
    res.status(200).send("Booking confirmed successfully.");
    
  } catch (err) {
    console.error("=== BOOKING CONFIRMATION ERROR ===");
    console.error(err);
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