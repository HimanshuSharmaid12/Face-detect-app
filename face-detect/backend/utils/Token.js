import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    return token;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};