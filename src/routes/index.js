import express from 'express';
import config from 'config';
import axios from 'axios';

import winstonLogger from '../lib/logger/winston';
import { postObservation } from '../lib/fhir/hapiFhir';
import { hasNoResponse } from '../lib/utils';

const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
const router = express.Router();

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
  const messageText = message.text.toLowerCase();
  let telegramResponse;
  switch (messageText) {
    case 'hi'
    case 'hello':
      telegramResponse = axios.post(telegramURL, {
        chat_id: message.chat.id,
        text:
          // eslint-disable-next-line max-len
          'Hello, there yourself!! Have you checked your glucose levels yet? If so, please enter the glucose level.',
      });
      break;

    default:
      // eslint-disable-next-line no-case-declarations
      const glucoseValue = message.text.match(NUMERIC_REGEXP);
      if (glucoseValue) {
        const patientId = config.get('application.hapiFhir.patientId');
        const fhirURL = config.get('application.hapiFhir.baseURL');
        const glucoseObservation = await postObservation(patientId, glucoseValue[0]);
        let text = 'Thank you for your glucose reading,';
        if (
          typeof glucoseObservation.resourceType !== 'undefined' &&
          glucoseObservation.resourceType === 'Observation'
        ) {
          text += ` this observation has been recorded: at ${fhirURL}/Observation/${glucoseObservation.id}. `;
        }
        text += 'I hope you are feeling well and having a great day!';
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text,
        });
      } else if (hasNoResponse(messageText)) {
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text:
            // eslint-disable-next-line max-len
            'Okay, please remember to check your glucose levels! I will check back later, to collect your glucose level.',
        });
      } else {
        telegramResponse = axios.post(telegramURL, {
          chat_id: message.chat.id,
          text: 'I hope you are feeling well and having a great day!',
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
