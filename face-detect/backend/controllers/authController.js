
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/Token.js";


export const signup = async (req, res, next) => {
  try {
    // Adjusted destructuring to match frontend (name, email, password)
    const { name, email, password } = req.body; 

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already registered" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }
    
    // Removed mobileNo validation as the field is not provided by the frontend

    const hashed = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name, // Use 'name' to match the updated model
      email,
      password: hashed,
      // Removed mobileNo and role from creation
    });
    
    const token = genToken(createdUser._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    // Send a friendly success message for the frontend to display
    res.status(201).json({ message: "Registration successful!", createdUser }); 
  } catch (error) {
    // Log the actual error on the server side for debugging
    console.error("Signup Error:", error.message);
    // Send a generic 500 message to the client
    res.status(500).json({ message: "Internal Server Error: Could not register user." }); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user does not exist" });
    }
    
    // ADDED: Robust check to ensure the user has a password set before comparing
    if (!user.password) {
        return res.status(400).json({ message: "This account was not set up with a password. Please check your registration method." });
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(400).json({ message: "password is incorrect" });
    }

    const token = genToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ message: "Login successful!", user });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error: Could not log in." });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "logout Successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Internal Server Error: Could not log out." });
  }
};
