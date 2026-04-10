import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  current_odo: number;
  daily_avg_km: number;
  avatar_url?: string;
  pushToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  current_odo: { type: Number, default: 0 },
  daily_avg_km: { type: Number, default: 15 },
  avatar_url: { type: String },
  pushToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
