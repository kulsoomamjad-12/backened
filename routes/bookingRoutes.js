import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getHotelBookings , getMyBookings , createBooking , checkAvailabilityApi} from "../controllers/controller";

const bookingRouter = express.Router();


bookingRouter.post('/check-availability', checkAvailabilityApi);
bookingRouter.post('/book',protect , createBooking);
bookingRouter.get('/user',protect , getMyBookings);
bookingRouter.get('/hotel',protect , getHotelBookings);


export default bookingRouter;
