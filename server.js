import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import "dotenv/config";
import cors from "cors";
import connectDB from './configs/db.js';
import { registerUser, loginUser, getMe } from './controllers/authController.js';
import { protect } from './middleware/authMiddleware.js';
import userRouter from './routes/userRoutes.js'; 
import hotelRouter from './routes/hotelRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

connectDB();
connectCloudinary();

const app = express();
app.use(cors());

// middleware
app.use(express.json());

// Auth routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/me', protect, getMe);

app.get('/', (req, res) => res.send("API is working fine"));
app.use("/api/users", userRouter); 
app.use("/api/hotels", hotelRouter); 
app.use("/api/rooms",roomRoutes) 
app.use("/api/bookings",bookingRoutes) 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

export default app;