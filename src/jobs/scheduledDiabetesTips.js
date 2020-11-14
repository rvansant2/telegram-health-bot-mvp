const config = require('config');
const { sample } = require('lodash');

const { scheduleDailyCheckIn } = require('../lib/utils');

const DIABETES_TIPS = [
  'Calories obtained from fructose (found in sugary beverages such as soda, energy and sports drinks, coffee drinks, and processed foods like doughnuts, muffins, cereal, candy and granola bars) are more likely to add weight around your abdomen',
  'You can enjoy your favorite treats as long as you plan properly and limit hidden sugars. Dessert doesn’t have to be off limits, as long as it’s a part of a healthy meal plan',
  'The type of carbohydrates you eat as well as serving size is key. Focus on whole grain carbs instead of starchy carbs since they’re high in fiber and digested slowly, keeping blood sugar levels more even.',
  'Studies have shown that eating too much protein, especially animal protein, may actually cause insulin resistance, a key factor in diabetes. A healthy diet includes protein, carbohydrates, and fats. Our bodies need all three to function properly. The key is a balanced diet.',
  'Eat more: Healthy fats from nuts, olive oil, fish oils, flax seeds, or avocados.',
  'Eat less: White bread, sugary cereals, refined pastas or rice.',
  'Exercise helps in reducing your blood sugar, if you have not excercised yet today, take a break and go for a short walk.',
];

const tip = sample(DIABETES_TIPS);
//console.log(tip);

// const userModel = require('../models/userModel').default;

// (async () => {
//   const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
//   const PATIENT_ID = config.get('application.hapiFhir.patientId');
//   const user = await userModel.findOne({ patientId: PATIENT_ID });

//   if (user) {
//     const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
//     const patientName = `${user.firstName} ${user.lastName}`;
//     const text = `🤖: Hello ${patientName}, I just wanted to send you a 'quick tip or fact' in managing your diabetes: ${tip}`;
//     const message = user.chatsetting[0].chatObject;
//     await scheduleDailyCheckIn(telegramURL, message, text);
//   }
// })();

const scheduledDiabetesTips = async () => {
  const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
  const patientName = 'Jack Doe';
  const text = `🤖: Hello ${patientName}, I just wanted to send you a 'quick tip or fact' in managing your diabetes: ${tip}`;
  const message = { chat: { id: '???????' } };
  await scheduleDailyCheckIn(telegramURL, message, text);
};

scheduledDiabetesTips();
