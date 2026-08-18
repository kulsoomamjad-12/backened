import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/room.js";
import Booking from "../models/booking.js";
import bcrypt from "bcryptjs";

// GET /api/users
// Returns the authenticated user's role
export const getUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("role");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    res.json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/users/profile
// Returns the authenticated user's full editable profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PUT /api/users/profile
// Update the authenticated user's username and/or email
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailTaken = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email: normalizedEmail },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE /api/users/account
// Deletes the authenticated user's account, along with any hotel/rooms they own
// and their own bookings, keeping the database consistent.
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to delete your account" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password is incorrect" });
    }

    const hotel = await Hotel.findOne({ owner: user._id });
    if (hotel) {
      const rooms = await Room.find({ hotel: hotel._id });
      const roomIds = rooms.map((room) => room._id);
      await Booking.deleteMany({ room: { $in: roomIds } });
      await Room.deleteMany({ hotel: hotel._id });
      await Hotel.deleteOne({ _id: hotel._id });
    }

    await Booking.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};