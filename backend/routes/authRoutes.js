import exp from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
export const authRoutes = exp.Router();
// register new user
authRoutes.post('/users', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, profileImageUrl } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    const userExists = await UserModel.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }
    const newUser = new UserModel({ firstName, lastName, email: normalizedEmail, password, role, profileImageUrl });
    await newUser.save();
    
    const token = generateToken(newUser._id, newUser.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
});
// user login and token generation
authRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await UserModel.findOne({ email: normalizedEmail });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});
// clear session cookie on logout
authRoutes.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "Logged out successfully" });
});
// get current logged in user profile (protected route)
authRoutes.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile retrieved", user });
  } catch (err) {
    next(err);
  }
});
// change user password securely
authRoutes.put('/password', verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);
    
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Invalid password" });
    } 
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// direct password reset (without verification code)
authRoutes.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }
    
    user.password = newPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();
    
    res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (err) {
    next(err);
  }
});

export default authRoutes;
