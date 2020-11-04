import express from 'express';
import config from 'config';
import axios from 'axios';
import get from 'lodash/get';
import moment from 'moment-timezone';

import winstonLogger from '../lib/logger/winston';
import { postObservation, getPatient } from '../lib/fhir/hapiFhir';
import { hasNoResponse, scheduleCheckIn, cleanseString } from '../lib/utils';
import { REGEX_PATTERNS } from '../lib/utils/regexes';

import userModel from '../models/userModel';
import bloodGlucoseModel from '../models/bloodGlucoseModel';

const PATIENT_ID = config.get('application.hapiFhir.patientId');
const router = express.Router();
const app = express();

/* GET home page. */
router.get('/', (req, res, next) => {
  const baseJSON = { success: true, message: 'Healthy check!' };
  res.status(200).json(baseJSON);
  next();
});

// eslint-disable-next-line max-statements
router.post('/new-message', async (req, res, next) => {
  const telegramURL = process.env.telegram_url || config.get('application.telegram.url');
  const { message } = req.body;
  if (!message) {
    return res.end();
  }
  const currentTime = moment()
    .tz(config.get('application.hapiFhir.patientTimezone'))
    .format('hh:mm z');
  const messageText = cleanseString(message.text.toLowerCase(), REGEX_PATTERNS.NO_SPECIAL_CHARS);
  const patientResponse = await getPatient(PATIENT_ID);
  const patientGivenName = get(patientResponse, 'name[0].given[0]', '');
  const patientFamilyName = get(patientResponse, 'name[0].family', '');
  const patientName = `${patientGivenName} ${patientFamilyName}`;
  let telegramResponse;
  switch (messageText) {
    case 'hi dab':
    case 'hello dab':
      telegramResponse = axios.post(telegramURL, {
        chat_id: message.chat.id,
        text:
          // eslint-disable-next-line max-len
          `🤖: Hello ${patientName}, there yourself!! It's ${currentTime}, have you checked your blood glucose levels yet? If so, please enter the glucose level. If you need more time to do so, please say "No, I haven't yet".`,
      });
      break;

    default:
      // eslint-disable-next-line no-case-declarations
      const glucoseValue = message.text.match(REGEX_PATTERNS.NUMERIC_REGEXP);
      if (glucoseValue) {
        const fhirURL = config.get('application.hapiFhir.baseURL');
        const glucoseObservation = await postObservation(PATIENT_ID, glucoseValue[0]);
        const user = await userModel.findOne({ patientId: PATIENT_ID });
        if (user.id) {
          const glucose = await bloodGlucoseModel.insertMany({
            glucose: glucoseValue[0],
            userId: user.id,
          });
          // eslint-disable-next-line no-underscore-dangle
          user.glucose.push(glucose[0]._id);
          user.save();
        }
        let text = `🤖: Thank you ${patientName}, for your glucose reading,`;
        if (
          typeof glucoseObservation.resourceType !== 'undefined' &&
          glucoseObservation.resourceType === 'Observation'
        ) {
          text += ` this observation has been recorded at: ${fhirURL}/Observation/${glucoseObservation.id}. `;
        }
        text += 'I hope you are feeling well and having a great day!';
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text,
        });
        if (app.locals.setAScheduledCheckIn) {
          clearInterval(app.locals.setAScheduledCheckIn);
        }
      } else if (hasNoResponse(messageText)) {
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text:
            // eslint-disable-next-line max-len
            `🤖: Okay ${patientName}, I'll check back in ${config.get(
              'application.hapiFhir.checkBackInTime',
            )} ${config.get(
              'application.hapiFhir.checkBackDuration',
            )}, but please remember to check your blood glucose levels! I will check back later, to collect your blood glucose level. It is important, to check your glucose everyday and is an important part of your diabetes management. `,
        });
        app.locals.setAScheduledCheckIn = setInterval(() => {
          scheduleCheckIn(telegramURL, message, patientName, res, next);
        }, config.get('application.hapiFhir.checkBackInterval'));
      } else {
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text: `🤖: ${patientName}, I hope you are feeling well and having a great day! If you would like to have your blood glucose reading taken, just say "Hi DAB or Hello DAB"`,
        });
      }
  }
  return telegramResponse
    .then(response => {
      winstonLogger.log(`Message posted: ${response}`);
      res.end('ok');
      next();
    })
    .catch(err => {
      winstonLogger.error('Error :', err);
      res.end(`Error :${err}`);
    });
});

export default router;
