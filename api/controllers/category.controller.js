import { Op } from "sequelize";
import { User, Provider, Service, Booking, Review, Category } from "../models/index.js";
import createError from "../utils/createError.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: {
        isActive: true 
      },
      order: [['name', 'ASC']]
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesPaginated = async (req, res, next) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await Category.count({
      where: {
        isActive: true
      }
    });

    // Fetch paginated categories
    const categories = await Category.findAll({
      where: {
        isActive: true
      },
      order: [['name', 'ASC']],
      limit,
      offset
    });

    // For each category, get the count of related services
    const categoriesWithServiceCount = await Promise.all(
      categories.map(async (category) => {
        // Get the plain object to modify
        const categoryObj = category.toJSON();
        
        // Count services related to this category (by categoryId or cat name)
        const serviceCount = await Service.count({
          where: {
            [Op.or]: [
              { categoryId: category.id },
              { cat: category.name }
            ]
          }
        });
        
        // Add service count to category object
        categoryObj.serviceCount = serviceCount;
        
        return categoryObj;
      })
    );

    // Return with pagination metadata
    res.status(200).json({
      categories: categoriesWithServiceCount,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};