import mongoose from 'mongoose';

mongoose.set('debug', true);

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const chatSettingsModelSchema = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  chatId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  createdAt: Date,
  updatedAt: Date,
};

const chatSettingsSchema = new Schema(chatSettingsModelSchema, schemaOptions);

chatSettingsSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  next();
});

// eslint-disable-next-line consistent-return
chatSettingsSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
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
    return new Error(`Chat Settings Schema findOneOrCreate error: ${e.message}.`);
  }
};

const chatSettingsModel = mongoose.model('chatsetting', chatSettingsSchema);

export default chatSettingsModel;
