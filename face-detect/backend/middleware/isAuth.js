const jwt = require("jsonwebtoken")

export const isAuth = (req, res, next)=>{
   try {
    const {token} = req.cookies;

    if(!token){
        return res.status(400).json({message: "Unauthorized"})
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.userId = decoded.userId;

    next()

   } catch (error) {
    console.log(error)
   } 
}
