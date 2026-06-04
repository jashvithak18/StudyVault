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

// forgot password request (generates 6-digit code and emails it)
authRoutes.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }
    
    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();
    
    console.log(`[PASSWORD RESET] Code for ${email} is: ${resetCode}`);
    
    const emailSubject = "StudyVault - Password Reset Verification Code";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0;">StudyVault 📚🧪</h2>
          <p style="color: #475569; font-size: 0.9rem;">Collaborative Academic Platform</p>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);">
          <h3 style="color: #0f172a; margin-top: 0;">Password Reset Request</h3>
          <p style="color: #475569; line-height: 1.5;">Hello ${user.firstName},</p>
          <p style="color: #475569; line-height: 1.5;">We received a request to reset your password for your StudyVault account. Please use the following 6-digit verification code to complete the reset process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 2.2rem; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.15);">${resetCode}</span>
          </div>
          <p style="color: #ef4444; font-size: 0.85rem; font-weight: 500;">This code will expire in 1 hour.</p>
          <p style="color: #475569; line-height: 1.5; font-size: 0.9rem; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 0.8rem;">
          &copy; ${new Date().getFullYear()} StudyVault. All rights reserved.
        </div>
      </div>
    `;

    try {
      const emailSent = await sendEmail(user.email, emailSubject, emailHtml);
      if (emailSent) {
        return res.status(200).json({ message: "Verification code sent to your email." });
      } else {
        // Fallback if SMTP env variables are missing
        return res.status(200).json({ 
          message: "SMTP keys missing in .env. Reset code returned in response for testing.", 
          code: resetCode 
        });
      }
    } catch (mailError) {
      return res.status(500).json({ message: "Failed to send verification email. Please check server SMTP configuration." });
    }
  } catch (err) {
    next(err);
  }
});

// reset password using verification code
authRoutes.post('/reset-password', async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }
    const user = await UserModel.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
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
