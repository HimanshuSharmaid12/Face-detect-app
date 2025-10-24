// import express from "express"
// import { login, logout, signup } from "../controllers/authController.js";
// const router = express.Router();


// router.post("/signup", signup)
// router.post("/login", login)
// router.get("/logout", logout)


// export default router;


import express from "express"
import { login, logout, signup } from "../controllers/authController.js";
const router = express.Router();

// CHANGE: Renamed "/signup" to "/register" to match the React frontend
router.post("/register", signup) 
router.post("/login", login)
router.get("/logout", logout)

export default router;
