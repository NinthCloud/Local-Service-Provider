import createError from "../utils/createError.js"; 
import { Op } from "sequelize"; 
import { Review, Service, Booking } from "../models/index.js";

export const createReview = async (req, res, next) => {
  try {
    // if (req.isSeller && req.approvedByAdmin === true) {
    //   return next(createError(403, "Sellers can't create a review!"));
    // }

    const { serviceId, desc, star, bookingId } = req.body;
    const userId = req.userId;

    // Find the specific booking
    const confirmedBooking = bookingId ? 
      await Booking.findByPk(bookingId) :
      await Booking.findOne({
        where: {
          serviceId: serviceId,
          buyerId: userId,
          status: "Confirmed"
        },
        order: [['updatedAt', 'DESC']] // Get the most recent confirmed booking
      });

    if (!confirmedBooking) {
      return next(
        createError(
          403,
          "You can only review services you have booked and confirmed."
        )
      );
    }

    if (confirmedBooking.buyerId !== userId) {
      return next(createError(403, "You can only review your own bookings."));
    }

    if (confirmedBooking.status !== "Confirmed") {
      return next(createError(403, "Booking must be confirmed before reviewing."));
    }

    // Check if this specific booking has already been reviewed
    const existingReview = await Review.findOne({
      where: {
        bookingId: confirmedBooking.id
      }
    });

    if (existingReview) {
      return next(
        createError(403, "You have already created a review for this booking!")
      );
    }

    // Create the review using Sequelize
    const newReview = await Review.create({
      userId: userId,
      serviceId: serviceId,
      bookingId: confirmedBooking.id,
      desc,
      star
    });

    // Update service rating using Sequelize
    const service = await Service.findByPk(serviceId);
    await service.increment('totalStars', { by: star });
    await service.increment('starNumber', { by: 1 });
    await service.save();

    res.status(201).send(newReview);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId;

    const reviews = await Review.findAll({
      where: {
        serviceId: serviceId
      },
      include: [
        {
          association: 'user',
          attributes: ['username', 'image'] // Include user details for the review
        }
      ],
      order: [['createdAt', 'DESC']] // Most recent reviews first
    });

    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.userId;

    const review = await Review.findByPk(reviewId);
        
    if (!review) {
      return next(createError(404, "Review not found"));
    }

    if (review.userId !== userId) {
      return next(createError(403, "You can only delete your own reviews"));
    }

    // Get the review star value and serviceId before deletion
    const reviewStar = review.star;
    const reviewServiceId = review.serviceId;

    // Delete the review
    await review.destroy();

    // Update service rating after review deletion
    const service = await Service.findByPk(reviewServiceId);
    await service.decrement('totalStars', { by: reviewStar });
    await service.decrement('starNumber', { by: 1 });
    await service.save();

    res.status(200).send({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// New controller to check for eligible bookings to review
// Enhanced version of getReviewableBookings
export const getReviewableBookings = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const userId = req.userId;
    
    // Find confirmed bookings for this service by this user
    const confirmedBookings = await Booking.findAll({
      where: {
        serviceId: serviceId,
        buyerId: userId,
        status: "Confirmed"
      },
      order: [['updatedAt', 'DESC']] // Most recent first
    });
    
    if (confirmedBookings.length === 0) {
      return res.status(200).json({ 
        canReview: false,
        message: "No confirmed bookings found for this service." 
      });
    }
    
    // Get all bookingIds to check in a single query
    const bookingIds = confirmedBookings.map(booking => booking.id);
    
    // Find all reviews for these bookings in one query
    const existingReviews = await Review.findAll({
      where: { 
        bookingId: {
          [Op.in]: bookingIds
        }
      }
    });
    
    // Create a set of already reviewed booking IDs for faster lookups
    const reviewedBookingIds = new Set(existingReviews.map(review => review.bookingId));
    
    // Filter out bookings that haven't been reviewed
    const reviewableBookings = confirmedBookings
      .filter(booking => !reviewedBookingIds.has(booking.id))
      .map(booking => ({
        bookingId: booking.id,
        bookingDate: booking.createdAt,
        confirmationDate: booking.updatedAt
      }));
    
    res.status(200).json({
      canReview: reviewableBookings.length > 0,
      reviewableBookings: reviewableBookings
    });
    
  } catch (err) {
    next(err);
  }
};