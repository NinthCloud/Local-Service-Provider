import { User, Provider } from "../models/index.js";
import bcrypt from "bcrypt";
import createError from "../utils/createError.js";
import sequelize from "../config/database.js";

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(createError(404, "User not found"));

    if (req.userId !== user.id) {
      return next(createError(403, "You can delete only your account"));
    }

    await user.destroy();
    res.status(200).send("User deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(createError(404, "User not found"));

    let userData = user.toJSON(); // Convert Sequelize model to plain JS object

    if (user.isSeller && user.approvedByAdmin) {
      const provider = await Provider.findOne({ 
        where: { userId: user.id } 
      });
      
      if (provider) {
        userData = { ...userData, ...provider.toJSON() };
      }
    }
    
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

// Single provider details
export const getProviderUser = async (req, res, next) => {
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

// GET /users/provider/:userId
export const getProviderForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const provider = await Provider.findOne({ 
      where: { userId: parseInt(userId) },
      attributes: ['id', 'userId', 'verify', 'desc', 'serviceLevel', 'experience', 'profession', 'serviceHours', 'providerName'] 
    });
    
    if (!provider) {
      return res.status(404).json({ message: "No provider found for this user" });
    }
    
    res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const {
      isSeller,
      providerName,
      providerAddress,
      providerEmail,
      providerPhone,
      serviceLevel,
      experience,
      profession,
      serviceHours,
      verify,
      dob,
      desc,
      password,
      ...updatedUserData
    } = req.body;

    // Start transaction
    const t = await User.sequelize.transaction();

    try {
      // **Check if password is provided & hash it**
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updatedUserData.password = await bcrypt.hash(password, salt);
      }

      // **Update user details first**
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "User not found" });
      }
      
      await user.update(updatedUserData, { transaction: t });

      // **Handle provider-related logic**
      let providerData = await Provider.findOne({ 
        where: { userId: user.id },
        transaction: t
      });

      if (isSeller) {
        // **User is becoming a provider (again or for the first time)**
        if (!providerData) {
          providerData = await Provider.create({
            userId: user.id,
            appliedForProvider: true,
            serviceLevel: serviceLevel || "",
            experience: experience || "",
            profession: profession || "",
            serviceHours: serviceHours || "",
            verify: verify || "",
            dob: dob || null,
            desc: desc || "",
            providerName: providerName || "",
            providerAddress: providerAddress || "",
            providerEmail: providerEmail || "",
            providerPhone: providerPhone || "",
          }, { transaction: t });

          user.provider = providerData.id;
        } else {
          // **Update existing provider entry**
          await providerData.update({
            appliedForProvider: true,
            serviceLevel: serviceLevel || providerData.serviceLevel,
            experience: experience || providerData.experience,
            profession: profession || providerData.profession,
            serviceHours: serviceHours || providerData.serviceHours,
            verify: verify || providerData.verify,
            dob: dob || providerData.dob,
            desc: desc || providerData.desc,
            providerName: providerName || providerData.providerName,
            providerAddress: providerAddress || providerData.providerAddress,
            providerEmail: providerEmail || providerData.providerEmail,
            providerPhone: providerPhone || providerData.providerPhone,
          }, { transaction: t });
        }

        // **Ensure isSeller is true when applying/reapplying**
        user.isSeller = true;
        await user.save({ transaction: t });
      } else {
        // **User is stopping being a provider**
        if (providerData) {
          await providerData.update(
            { appliedForProvider: false },
            { transaction: t }
          );
        }

        user.isSeller = false;
        await user.save({ transaction: t });
      }

      // Commit transaction
      await t.commit();

      res.status(200).json({
        message: "User and provider updated successfully",
        user: user,
      });
    } catch (error) {
      // Rollback transaction in case of error
      await t.rollback();
      throw error;
    }
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

// Fetch all providers
export const getAllProviders = async (req, res, next) => {
  // try {
  //   const providers = await Provider.findAll({
  //     include: [
  //       {
  //         model: User,
  //         as: 'user',
  //         attributes: ['username', 'email']
  //       }
  //     ]
  //   });
  //   res.status(200).json(providers);
  // } catch (err) {
  //   next(err);
  // }
};

// Fetch a single provider by ID
export const getProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    //console.log("Fetching provider with ID:", id);

    // First check if the ID is a provider ID
    let provider = await Provider.findByPk(id);
    
    // If not found by PK, check if it's a userId instead
    if (!provider) {
      provider = await Provider.findOne({ where: { userId: id } });
    }

    if (!provider) {
      //console.log("❌ Provider not found for ID:", id);
      return res.status(404).json({ error: "Provider not found" });
    }

   // console.log("✅ Provider found:", provider);
    res.status(200).json(provider);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find user by ID
    const user = await User.findByPk(req.userId);
    if (!user) return next(createError(404, "User not found"));

    // Compare the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return next(createError(400, "Incorrect old password"));

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    next(err);
  }
};