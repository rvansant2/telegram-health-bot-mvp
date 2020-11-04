import mongoose from 'mongoose';

mongoose.set('debug', true);

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const bloodGlucoseModelSchema = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  glucose: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  createdAt: Date,
  updatedAt: Date,
};

const bloodGlucoseSchema = new Schema(bloodGlucoseModelSchema, schemaOptions);

bloodGlucoseSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  next();
});

// eslint-disable-next-line consistent-return
bloodGlucoseSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
  try {
    const bloodGlucose = await this.findOneAndUpdate(
      query,
      { $setOnInsert: data },
      { upsert: true, new: true },
    ).exec();

    if (bloodGlucose) {
      return bloodGlucose;
    }
  } catch (e) {
    return new Error(`Blood Glucose Schema findOneOrCreate error: ${e.message}.`);
  }
};

const bloodGlucoseModel = mongoose.model('glucose', bloodGlucoseSchema);

export default bloodGlucoseModel;
