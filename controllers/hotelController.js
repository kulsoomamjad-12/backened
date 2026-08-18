import Hotel from "../models/Hotel.js";
import User from "../models/User.js";


export const registerHotel = async(req, res) => {
  
  try {
    const {name, address, contact, city} = req.body;
    const owner = req.user._id;

    // check if user already registered
    const existingHotel = await Hotel.findOne({owner});
    if(existingHotel) {
      return res.json({success:false, message:"You already registered a hotel"})
    }
    const hotel = await Hotel.create({name, address, contact, owner, city});
    await User.findByIdAndUpdate(owner, {role:"hotelOwner"});

    res.json({success:true, hotel , message: "hotel registered successfully"});
    
  } catch (error) {
    res.json({success:false, message:error.message})
  }
}