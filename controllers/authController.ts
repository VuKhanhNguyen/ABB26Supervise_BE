import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import cloudinary from "../config/cloudinary";

const JWT_SECRET =
  process.env.JWT_SECRET || "AB26SuperviseSecretKey_Very_Strong_123";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, current_odo, daily_avg_km } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      current_odo: current_odo || 0,
      daily_avg_km: daily_avg_km || 15,
    });

    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        current_odo: user.current_odo,
        daily_avg_km: user.daily_avg_km,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Log in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        current_odo: user.current_odo,
        daily_avg_km: user.daily_avg_km,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

import * as alertService from "../services/alertService";

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, current_odo, daily_avg_km } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Handle avatar upload to Cloudinary
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "ab26supervise_avatars",
      });
      user.avatar_url = uploadResult.secure_url;
    }

    if (name) user.name = name;
    if (current_odo !== undefined) user.current_odo = Number(current_odo);
    if (daily_avg_km !== undefined) user.daily_avg_km = Number(daily_avg_km);

    await user.save();

    // Trigger immediate maintenance check and notification
    await alertService.checkMaintenanceAndNotify(user._id.toString());

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        current_odo: user.current_odo,
        daily_avg_km: user.daily_avg_km,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updatePushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pushToken } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    user.pushToken = pushToken;
    await user.save();
    
    res.json({ message: "Push token updated successfully" });
  } catch (error) {
    console.error("Update push token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

