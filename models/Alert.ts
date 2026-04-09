import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  tag: string;
  category: 'Critical' | 'Reminder' | 'Healthy';
  icon: string;
  variant: 'critical' | 'reminder' | 'healthy';
  hasRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, required: true },
  category: { type: String, enum: ['Critical', 'Reminder', 'Healthy'], required: true },
  icon: { type: String, required: true },
  variant: { type: String, enum: ['critical', 'reminder', 'healthy'], required: true },
  hasRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IAlert>('Alert', alertSchema);
