import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceRule extends Document {
  name: string;
  interval_km: number;
  category: string;
}

const maintenanceRuleSchema = new Schema<IMaintenanceRule>({
  name: { type: String, required: true },
  interval_km: { type: Number, required: true },
  category: { type: String },
});

export default mongoose.model<IMaintenanceRule>('MaintenanceRule', maintenanceRuleSchema);
