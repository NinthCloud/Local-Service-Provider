import express from "express"
import {register, login, logout,  resetPassword, verifySecurityQuestions, getSecurityQuestions, requestPasswordReset} from "../controllers/auth.controllerr.js"


 const router = express.Router();

 router.post("/register", register)
 router.post("/login", login)
 router.post("/logout", logout)

 // Password reset routes
 router.post("/password-reset/request", requestPasswordReset);
 router.get("/password-reset/questions/:userId", getSecurityQuestions);
 router.post("/password-reset/verify", verifySecurityQuestions);
 router.post("/password-reset/reset", resetPassword);

 export default router; 