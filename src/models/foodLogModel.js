import mongoose from 'mongoose';

mongoose.set('debug', true);

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const foodLogModelSchema = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  meal: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  createdAt: Date,
  updatedAt: Date,
};

const foodLogSchema = new Schema(foodLogModelSchema, schemaOptions);

foodLogSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  next();
});

// eslint-disable-next-line consistent-return
foodLogSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
  try {
    const foodLog = await this.findOneAndUpdate(
      query,
      { $setOnInsert: data },
      { upsert: true, new: true },
    ).exec();

    if (foodLog) {
      return foodLog;
    }
  } catch (e) {
    return new Error(`Food Log Schema findOneOrCreate error: ${e.message}.`);
  }
};

const foodLogModel = mongoose.model('food', foodLogSchema);

export default foodLogModel;
