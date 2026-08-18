import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getHotelBookings , getMyBookings , createBooking , checkAvailabilityApi} from "../controllers/controller.js";

const bookingRouter = express.Router();


bookingRouter.post('/check-availability', checkAvailabilityApi);
bookingRouter.post('/book',protect , createBooking);
bookingRouter.get('/user',protect , getMyBookings);
bookingRouter.get('/hotel',protect , getHotelBookings);


export default bookingRouter;
