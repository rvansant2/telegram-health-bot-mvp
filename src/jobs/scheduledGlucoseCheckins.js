const config = require('config');

const { scheduleDailyCheckIn } = require('../lib/utils');
const userModel = require('../models/userModel').default;

// (async () => {
//   const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
//   const PATIENT_ID = config.get('application.hapiFhir.patientId');
//   const user = await userModel.findOne({ patientId: PATIENT_ID });

//   if (user) {
//     const patientName = `${user.firstName} ${user.lastName}`;
//     const text = `🤖: Hello ${patientName}, I just wanted to check in to see have you checked your blood glucose levels yet? If so, please enter the glucose level by replying "Yes DAB, my glucose is XXX".`;
//     const message = user.chatsetting[0].chatObject;
//     await scheduleDailyCheckIn(telegramURL, message, text);
//   }
// })();

const scheduledGlucoseCheckins = async () => {
  const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
  const patientName = 'Jack Doe';
  const text = `🤖: Hello ${patientName}, I just wanted to check in to see have you checked your blood glucose levels yet? If so, please enter the glucose level by replying "Yes DAB, my glucose is XXX".`;
  const message = { chat: { id: '???????' } };
  await scheduleDailyCheckIn(telegramURL, message, text);
};

scheduledGlucoseCheckins();
