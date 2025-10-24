import User from "../models/user.model.js"

export const currUser = async (req, res, next)=>{
    try {
       const id = req.userId;

       const user = await User.findById(id)
       
       if(!user){
        return res.status(400).json({message: "Unauthorized"})
       }

       return res.status(200).json({user})
       
    } catch (error) {
        console.log(error)
    }
}