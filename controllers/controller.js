import Booking from "../models/booking.js";
import Room from "../models/room.js";
import Hotel from "../models/Hotel.js";

// check availability of room

const checkAvailability = async ({checkInDate, checkOutDate, room}) => {
  try{
     const bookings = await Booking.find({
     room,
     checkInDate: {$lt :checkOutDate},
     checkOutDate: {$gt :checkInDate},
     });
     const isAvailable = bookings.length === 0;
     return isAvailable;

  }catch (error) {
    console.log(error.message);
  }
}

//API to check availability of room
// post api/bookings/check-availability

export const checkAvailabilityApi = async (req, res) =>{
  try {
    const {checkInDate, checkOutDate, room} = req.body;
    const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
    res.json({success: true, isAvailable});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}


// API to create a new booking
// post api/bookings/book

export const createBooking = async (req, res) => {
  try {
    const {checkInDate, checkOutDate, room, guests} = req.body;
    const user = req.user._id;

    // before booking check availability
    const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
    if(!isAvailable) {
      return res.json({success:false, message:"Room is not available"});
    }

    //total price
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    //calculate totalprice based on nights
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));


    totalPrice *= nights ;
    await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    })
       res.json({success:true, message:"booking created successfully"});
  } catch (error) {
    console.log(error.message);
    res.json({success:false, message:"failed to create booking"});
  }
};


// API to get  all bookings of a user
// GET /api/bookings/users

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate("room hotel").sort({createdAt: -1});
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "failed to get bookings" });
  }
};

// API to get all bookings of an owner
// GET /api/bookings/owner-bookings

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({owner : req.user._id});
    if (!hotel)
    {
      return res.json({success:false, message:"hotel not found"})
    }
    const bookings = await Booking.find({ hotel: hotel._id }).populate("room user").sort({createdAt: -1});
   //total bookings
   const totalBookings = bookings.length;
    //total revenue
    const totalRevenue = bookings.reduce((acc, booking)=> acc + booking.totalPrice, 0);

    res.json({ success: true, dashboardData:{totalBookings, totalRevenue, bookings} });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "failed to get bookings" });
  }
};
