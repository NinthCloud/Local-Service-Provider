import { Op } from 'sequelize';
import { Service, sequelize } from '../models/index.js';

const removeExpiredSlots = async () => {
  try {
    const currentDateTime = new Date(); // Get current UTC time
    const localOffset = currentDateTime.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localTime = new Date(currentDateTime - localOffset); // Adjust to local time
    
   // console.log(`Current time for comparison: ${localTime.toISOString()}`);

    // Find all services that have availability
    const services = await Service.findAll({
      where: {
        isDeleted: false,
        // Use a raw SQL condition for JSONB array length check
        [Op.and]: [
          sequelize.literal('JSONB_ARRAY_LENGTH(availability) > 0')
        ]
      }
    });

    //console.log(`Found ${services.length} services with availability`);

    let updatedServiceCount = 0;

    for (const service of services) {
      let updated = false;
      
      // Ensure availability is an array
      let availability = service.availability || [];
      if (!Array.isArray(availability)) {
        //console.log(`Service ${service.id} has invalid availability format`);
        continue;
      }
      
      // Process each date entry
      for (let i = 0; i < availability.length; i++) {
        const dateEntry = availability[i];
        
        // Skip invalid entries
        if (!dateEntry || !dateEntry.date || !dateEntry.slots || !Array.isArray(dateEntry.slots)) {
          continue;
        }
        
        const initialSlotsCount = dateEntry.slots.length;
        
        // Filter out expired slots AND booked slots
        const updatedSlots = dateEntry.slots.filter(slot => {
          if (!slot || !slot.time) return false;
          
          // Remove if slot is booked
          if (slot.isBooked === true) return false;
          
          try {
            // Create a date object from the slot date and time
            const slotDateTime = new Date(`${dateEntry.date}T${slot.time}`);
            
            // Skip invalid dates
            if (isNaN(slotDateTime.getTime())) return false;
            
            // Keep only future slots
            return slotDateTime > localTime;
          } catch (error) {
            console.error(`Error processing slot for service ${service.id}:`, error);
            return false;
          }
        });
        
        // If slots were removed, update the entry
        if (updatedSlots.length !== initialSlotsCount) {
          dateEntry.slots = updatedSlots;
          updated = true;
          //console.log(`Removed ${initialSlotsCount - updatedSlots.length} slots from service ${service.id} for date ${dateEntry.date}`);
        }
      }
      
      // Remove date entries that have no slots
      const newAvailability = availability.filter(dateEntry => 
        dateEntry && dateEntry.slots && dateEntry.slots.length > 0
      );
      
      // Update service if any changes were made
      if (updated || newAvailability.length !== availability.length) {
        await service.update({
          availability: newAvailability
        });
        updatedServiceCount++;
        console.log(`✅ Expired and booked slots removed for service ID: ${service.id}`);
      }
    }

   // console.log(`🚀 Expired and booked slots cleanup completed. Updated ${updatedServiceCount} services.`);
  } catch (error) {
    console.error("❌ Error removing expired and booked slots:", error);
  }
};

export default removeExpiredSlots;