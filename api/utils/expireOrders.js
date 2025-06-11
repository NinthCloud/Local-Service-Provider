import { Op } from 'sequelize';
import {Booking} from '../models/index.js';

const expirePastOrders = async () => {
  try {
    // Get current local date-time without altering the timezone
    const currentDateTime = new Date();

    // Find bookings where status is "Pending" or "Confirmed"
    const bookingsToCheck = await Booking.findAll({
      where: {
        status: {
          [Op.in]: ['Pending', 'Confirmed']
        },
        preferredDate: {
          [Op.not]: null
        },
        preferredTime: {
          [Op.not]: null
        }
      }
    });

    if (bookingsToCheck.length === 0) {
      return;
    }

    let expiredBookingIds = [];

    bookingsToCheck.forEach((booking) => {
      // Construct the correct booking Date-Time object
      const bookingDateTimeString = `${booking.preferredDate} ${booking.preferredTime}`;
      const bookingDateTime = new Date(bookingDateTimeString);

      // Compare booking time with the actual current time
      if (bookingDateTime <= currentDateTime) {
        expiredBookingIds.push(booking.id);
      }
    });

    if (expiredBookingIds.length === 0) {
      return;
    }

    // Update bookings to "Expired"
    await Booking.update(
      { status: 'Expired' },
      {
        where: {
          id: {
            [Op.in]: expiredBookingIds
          }
        }
      }
    );

    //console.log(`🚀 ${expiredBookingIds.length} bookings have been marked as expired.`);
  } catch (error) {
    console.error("❌ Error expiring past bookings:", error);
  }
};

export default expirePastOrders;