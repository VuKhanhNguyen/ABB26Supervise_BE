import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IMaintenanceLog extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  part_name: string;
  odo_at_service: number;
  next_service_odo: number;
  cost?: number;
  notes?: string;
  receipt_image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceLogSchema = new Schema<IMaintenanceLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  part_name: { type: String, required: true },
  odo_at_service: { type: Number, required: true },
  next_service_odo: { type: Number, required: true },
  cost: { type: Number },
  notes: { type: String },
  receipt_image_url: { type: String },
}, { timestamps: true });

export default mongoose.model<IMaintenanceLog>('MaintenanceLog', maintenanceLogSchema);
