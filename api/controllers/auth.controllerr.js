// import User from "../models/user.js";
// import Provider from "../models/provider.js"; // Import Provider model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import sequelize from "../config/database.js"; // Make sure this is at the top
import { User, Provider } from "../models/index.js";
// import { Provider } from "../models/index.js";

export const register = async (req, res, next) => {
  try {
    //console.log("📥 Received Request Body:", req.body);
    // ✅ Use sequelize directly instead of User.sequelize
    const transaction = await sequelize.transaction();

    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);

      // Convert empty strings to null or appropriate values for numeric fields
      const pincode =
        req.body.pincode === "" ? null : parseInt(req.body.pincode, 10);
      const phone = req.body.phone === "" ? null : req.body.phone;

      // Create a new user
      const newUser = await User.create(
        {
          username: req.body.username,
          email: req.body.email,
          fullName: req.body.fullName,
          password: hash,
          image: req.body.image,
          city: req.body.city,
          address: req.body.address,
          pincode: pincode,
          phone: phone,
          desc2: req.body.desc2,
          role: req.body.role || "user",
          isSeller: req.body.isSeller || false,
          appliedForProvider: req.body.appliedForProvider || false,
          securityQA: req.body.securityQA || []
        },
        { transaction }
      );

      // If the user wants to be a provider, create a Provider record
      if (req.body.isSeller) {
        if (
          !req.body.providerName ||
          !req.body.providerEmail ||
          !req.body.providerAddress ||
          !req.body.providerPhone ||
          !req.body.verify
        ) {
          await transaction.rollback();
          return res
            .status(400)
            .send("Please fill all provider-specific fields.");
        }

        let formattedDob = null; // Default to null

        if (req.body.dob && req.body.dob.trim() !== "") {
          // Only try to parse if there's a value
          const dobDate = new Date(req.body.dob);
          if (isNaN(dobDate.getTime())) {
            await transaction.rollback();
            return res
              .status(400)
              .send("Invalid date format for date of birth.");
          }
          formattedDob = dobDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        }

        const newProvider = await Provider.create(
          {
            userId: newUser.id,
            dob: formattedDob,
            verify: req.body.verify,
            serviceLevel: req.body.serviceLevel,
            experience: req.body.experience,
            profession: req.body.profession,
            serviceHours: req.body.serviceHours,
            desc: req.body.desc,
            providerName: req.body.providerName,
            providerAddress: req.body.providerAddress,
            providerEmail: req.body.providerEmail,
            providerPhone: req.body.providerPhone,
          },
          { transaction }
        );

        // Update the user model with the provider reference
        await newUser.update({ providerId: newProvider.id }, { transaction });
      }

      // ✅ Commit the transaction
      await transaction.commit();
      res.status(201).send("User created successfully.");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    console.error("Error creating user:", err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // Find user with provider association
    const user = await User.findOne({
      where: { username: req.body.username },
      include: [
        {
          model: Provider,
          as: "provider",
        },
      ],
    });

    if (!user) return next(createError(404, "User not found"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) return next(createError(400, "Wrong password or username"));

    // Generate JWT including provider info
    const tokenPayload = {
      id: user.id,
      isSeller: user.isSeller,
      appliedForProvider: user.appliedForProvider,
      approvedByAdmin: user.approvedByAdmin,
      providerId: user.provider ? user.provider.id : null,
      role: user.role || "user",
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_KEY);

    // Remove password from user object
    const userJSON = user.toJSON();
    delete userJSON.password;

    res
      .cookie("accessToken", token, { httpOnly: true })
      .status(200)
      .send(userJSON);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has logged out");
};

export const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(createError(400, "Email is required"));
  }
  
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    if (!user.securityQA || user.securityQA.length === 0) {
      return next(createError(400, "No security questions found for this account"));
    }
    
    // Return user id and count of questions
    return res.status(200).json({ 
      message: 'Security questions found',
      questionCount: user.securityQA.length,
      userId: user.id
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return next(createError(500, "Server error. Please try again."));
  }
};

// Get security questions for a user
export const getSecurityQuestions = async (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId) {
    return next(createError(400, "User ID is required"));
  }
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    if (!user.securityQA || user.securityQA.length === 0) {
      return next(createError(400, "No security questions found for this account"));
    }
    
    // Return only the questions, not the answers
    const questions = user.securityQA.map(qa => ({
      questionId: qa.question.replace(/\s+/g, '').toLowerCase(), // Create a simple ID
      question: qa.question
    }));
    
    return res.status(200).json({
      message: 'Security questions retrieved',
      questions
    });
  } catch (error) {
    console.error('Get security questions error:', error);
    return next(createError(500, "Server error. Please try again."));
  }
};

// Verify security questions
export const verifySecurityQuestions = async (req, res, next) => {
  const { userId, answers } = req.body;
  
  if (!userId || !answers || !Array.isArray(answers)) {
    return next(createError(400, "User ID and answers are required"));
  }
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    if (!user.securityQA || user.securityQA.length === 0) {
      return next(createError(400, "No security questions set for this account"));
    }
    
    // Check if the number of answers matches the number of questions
    if (answers.length !== user.securityQA.length) {
      return next(createError(400, `Please answer all ${user.securityQA.length} security questions`));
    }
    
    // Verify each answer against stored questions
    let allCorrect = true;
    const questionsWithStatus = user.securityQA.map((qa, index) => {
      const isCorrect = answers[index].answer === qa.answer;
      if (!isCorrect) allCorrect = false;
      
      return {
        question: qa.question,
        isCorrect
      };
    });
    
    if (allCorrect) {
      // Generate a password reset token with shorter expiry
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_KEY, // Using your existing JWT key
        { expiresIn: '15m' }
      );
      
      return res.status(200).json({
        message: 'Security questions verified successfully',
        resetToken
      });
    } else {
      return next(createError(400, "One or more answers are incorrect"));
    }
  } catch (error) {
    console.error('Security question verification error:', error);
    return next(createError(500, "Server error. Please try again."));
  }
};

// Reset password after security questions are verified
export const resetPassword = async (req, res, next) => {
  const { resetToken, newPassword } = req.body;
  
  if (!resetToken || !newPassword) {
    return next(createError(400, "Reset token and new password are required"));
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(resetToken, process.env.JWT_KEY);
    
    // Check if token is for password reset
    if (!decoded || !decoded.userId || decoded.purpose !== 'password-reset') {
      return next(createError(400, "Invalid or expired reset token"));
    }
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hash;
    await user.save();
    
    return res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError(400, "Invalid or expired reset token"));
    }
    
    console.error('Password reset error:', error);
    return next(createError(500, "Server error. Please try again."));
  }
};