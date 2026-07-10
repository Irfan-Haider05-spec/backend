import { Schema, model } from 'mongoose';
import { IDisclaimer, DisclaimerModel } from './disclaimer.interface';
import { DisclaimerTypes } from './disclaimer.constants';

const disclaimerSchema = new Schema<IDisclaimer, DisclaimerModel>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(DisclaimerTypes),
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Disclaimer = model<IDisclaimer, DisclaimerModel>(
  'Disclaimer',
  disclaimerSchema
);
