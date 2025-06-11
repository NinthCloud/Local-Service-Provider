import { Op } from "sequelize";
import { sequelize } from "../models/index.js";
import { Service, Provider, User } from "../models/index.js";
import createError from "../utils/createError.js";

export const createGig = async (req, res, next) => {
  if (!req.isSeller && !req.approvedByAdmin)
    return next(createError(403, "Only sellers can create a service"));

  try {
    // Find the provider associated with the user
    const provider = await Provider.findOne({
      where: { userId: req.userId },
    });

    if (!provider) {
      return next(
        createError(
          404,
          "Provider profile not found. Please complete your provider profile first."
        )
      );
    }

    const newService = await Service.create({
      providerId: provider.id, // Use providerId instead of userId
      ...req.body,
    });

    res.status(201).json(newService);
  } catch (err) {
    console.error("Service creation error:", err);
    next(err);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) return next(createError(404, "Service not found"));

    // Get the provider associated with the user
    const provider = await Provider.findOne({
      where: { userId: req.userId },
    });

    if (!provider) {
      return next(createError(404, "Provider profile not found"));
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId !== provider.id) {
      return next(createError(403, "You can only update your own service"));
    }

    // Toggle the isDeleted status
    service.isDeleted = !service.isDeleted;
    await service.save();

    res
      .status(200)
      .json({
        message: `Service ${service.isDeleted ? "deleted" : ""} successfully`,
        service,
      });
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    //console.log("Received ID:", req.params.id); // Debugging line

    const serviceId = parseInt(req.params.id, 10); // Ensure it's an integer

    if (isNaN(serviceId)) {
      return next(createError(400, "Invalid service ID"));
    }

    const service = await Service.findByPk(serviceId);
    if (!service) return next(createError(404, "Service not found!"));

    res.status(200).send(service);
  } catch (err) {
    next(err);
  }
};

// Function to get all services with filtering and sorting and searching
export const getGigs = async (req, res, next) => {
  try {
    const q = req.query;
   // console.log("Query parameters:", q); // Log query parameters
    
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
          { locationA: { [Op.contains]: [normalizedLocationQuery] } },
          { locationB: { [Op.contains]: [normalizedLocationQuery] } }
        ]
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
    
    //console.log("Cleaned search term:", cleanedSearchTerm); // Log cleaned search term
    
    // Check if search vectors are populated in the database
    const hasSearchVectors = await Service.findOne({
      where: sequelize.literal("search_vector IS NOT NULL"),
      raw: true
    });
    
    // Handle search terms
    if (cleanedSearchTerm) {
      if (hasSearchVectors) {
        // Use full-text search if search_vector is populated
        // Convert search terms to tsquery format
        const searchTerms = cleanedSearchTerm
          .split(/\s+/)
          .filter(k => k.length > 0)
          .map(term => {
            // Escape special characters that could cause syntax issues
            const escapedTerm = term.replace(/[&|!:*()]/g, '');
            return escapedTerm ? escapedTerm + ':*' : '';
          })
          .filter(Boolean) // Remove any empty terms
          .join(' & ');
        
        //console.log("Formatted search terms:", searchTerms); // Log formatted search terms
        
        if (searchTerms) {
          try {
            // Use parameter binding for safety
            whereClause = {
              ...whereClause,
              [Op.and]: [
                ...Object.keys(whereClause).map(key => ({ [key]: whereClause[key] })),
                sequelize.literal(`search_vector @@ to_tsquery('english', '${searchTerms.replace(/'/g, "''")}')`),
              ]
            };
          } catch (err) {
            console.error("Error creating full-text search condition:", err);
            // Fall back to simpler search if there's an error with the full-text search
          }
        }
      } else {
        // Use fallback basic search if search_vector is not populated
        const searchTerms = cleanedSearchTerm.split(/\s+/).filter(k => k.length > 0);
        
        if (searchTerms.length > 0) {
          const searchConditions = searchTerms.map(term => ({
            [Op.or]: [
              { title: { [Op.iLike]: `%${term}%` } },
              { desc: { [Op.iLike]: `%${term}%` } },
              { shortTitle: { [Op.iLike]: `%${term}%` } },
              { shortDesc: { [Op.iLike]: `%${term}%` } },
              { cat: { [Op.iLike]: `%${term}%` } }
            ]
          }));
          
          whereClause = {
            ...whereClause,
            [Op.and]: [
              ...Object.keys(whereClause).map(key => ({ [key]: whereClause[key] })),
              ...searchConditions
            ]
          };
        }
      }
    }

    if (q.providerId) {
      whereClause.providerId = q.providerId;
    }
    
    // Check if we need to filter by userId and convert it to providerId
    if (q.userId) {
      // Find the provider associated with the userId
      const provider = await Provider.findOne({
        where: { userId: q.userId }
      });
      
      if (provider) {
        whereClause.providerId = provider.id;
      } else {
        // If no provider found for this user, return empty result
        return res.status(200).json({
          services: [],
          totalPages: 0,
          currentPage: 1,
          totalServices: 0,
        });
      }
    }
    
    // Add category filter if provided
    if (q.cat) whereClause.cat = q.cat;
    
    // Enhanced sorting logic
    let order = [];
    
    switch (q.sort) {
      case "sales":
        order.push(['sales', 'DESC']);
        break;
      case "createdAt":
      case "recent":
        order.push(['createdAt', 'DESC']);
        break;
      case "HighestRated":
        order.push(['totalStars', 'DESC'], ['starNumber', 'DESC']);
        break;
      case "priceAsc":
        order.push(['price', 'ASC']);
        break;
      case "priceDesc":
        order.push(['price', 'DESC']);
        break;
      case "mostReviews":
        order.push(['starNumber', 'DESC']);
        break;
      default:
        order.push(['createdAt', 'DESC']); // Default to newest
    }
    
    // Add relevance-based sorting for search results
    if (cleanedSearchTerm && hasSearchVectors) {
      const searchTerms = cleanedSearchTerm
        .split(/\s+/)
        .filter(k => k.length > 0)
        .map(term => {
          const escapedTerm = term.replace(/[&|!:*()]/g, '');
          return escapedTerm ? escapedTerm + ':*' : '';
        })
        .filter(Boolean)
        .join(' & ');
      
      if (searchTerms) {
        // Use parameter binding for security
        const safeSearchTerms = searchTerms.replace(/'/g, "''");
        
        // Add relevance ranking to sort results
        order.unshift([
          sequelize.literal(`ts_rank(search_vector, to_tsquery('english', '${safeSearchTerms}'))`),
          'DESC'
        ]);
      }
    }
    
    // Pagination logic
    const page = parseInt(q.page, 10) || 1;
    const limit = parseInt(q.limit, 10) || 6;
    const offset = (page - 1) * limit;
    
    console.log("Final where clause:", JSON.stringify(whereClause, null, 2)); // Log final where clause
    console.log("Order by:", order); // Log order clause
    
    // Fetch services with pagination
    const { rows: services, count: totalServices } = await Service.findAndCountAll({
      where: whereClause,
      order,
      limit,
      offset,
      distinct: true
    });
    
    console.log(`Found ${services.length} services out of ${totalServices} total`); // Log found services
    
    // Return response with pagination data
    res.status(200).json({
      services,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      totalServices,
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    console.error("Stack trace:", err.stack); // Add stack trace for more debugging info
    next(err);
  }
};

export const editGig = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    // Check if the service exists
    if (!service) return next(createError(404, "Service not found!"));

    // Get the provider associated with the user
    const provider = await Provider.findOne({
      where: { userId: req.userId },
    });

    if (!provider) {
      return next(createError(404, "Provider profile not found"));
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId !== provider.id) {
      return next(createError(403, "You can only edit your own service"));
    }

    // Update the service with the new data
    await service.update(req.body);

    res.status(200).json(service);
  } catch (err) {
    next(err);
  }
};

export const toggleGigStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) return next(createError(404, "Service not found"));

    // Get the provider associated with the user
    const provider = await Provider.findOne({
      where: { userId: req.userId },
    });

    if (!provider) {
      return next(createError(404, "Provider profile not found"));
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId !== provider.id) {
      return next(createError(403, "You can only update your own service"));
    }

    service.isUnlisted = !service.isUnlisted; // Toggle the status
    await service.save();

    res
      .status(200)
      .json({
        message: `Service ${
          service.isUnlisted ? "unlisted" : "listed"
        } successfully`,
        service,
      });
  } catch (err) {
    next(err);
  }
};

// Update service availability
export const updateGigAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body; // Expecting availability to be an array of date and slots

    const service = await Service.findByPk(id);
    if (!service) return next(createError(404, "Service not found"));

    // Get the provider associated with the user
    const provider = await Provider.findOne({
      where: { userId: req.userId },
    });

    if (!provider) {
      return next(createError(404, "Provider profile not found"));
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId !== provider.id) {
      return next(createError(403, "Unauthorized"));
    }

    // Get current availability
    let currentAvailability = service.availability || [];

    // Update availability
    availability.forEach(({ date, slots }) => {
      // Find the existing date entry
      let existingDateIndex = currentAvailability.findIndex(
        (a) => a.date === date
      );

      if (existingDateIndex !== -1) {
        // Merge new slots with existing ones, avoiding duplicates
        slots.forEach((newSlot) => {
          const slotExists = currentAvailability[existingDateIndex].slots.some(
            (s) => s.time === newSlot.time
          );
          if (!slotExists) {
            currentAvailability[existingDateIndex].slots.push(newSlot);
          }
        });
      } else {
        // Add a new date and slots if it doesn't exist
        currentAvailability.push({ date, slots });
      }
    });

    // Update the service with new availability
    service.availability = currentAvailability;
    await service.save();

    res.status(200).json({ message: "Availability updated", service });
  } catch (err) {
    next(err);
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Find availability for the given date
    const availabilityForDate = (service.availability || []).find(
      (avail) => avail.date === date
    );

    if (!availabilityForDate) {
      return res.status(200).json([]); // No availability for this date
    }

    // Extract slots
    const availableSlots = availabilityForDate.slots.map((slot) => ({
      time: slot.time,
      isBooked: slot.isBooked,
    }));

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSales = async (req, res, next) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    // Find the service
    const service = await Service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Increment sales
    service.sales += 1;
    await service.save();

    res
      .status(200)
      .json({ message: "Sales updated successfully", updatedService: service });
  } catch (error) {
    console.error("Error updating sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
