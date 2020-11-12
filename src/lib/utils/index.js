import config from 'config';
import axios from 'axios';
import isArray from 'lodash/isArray';

import winstonLogger from '../logger/winston';

const NO_WORD_REGEXP = /no+\W/gi;

export const hasNoResponse = textResponse => {
  const hasNoInResponse = textResponse.match(NO_WORD_REGEXP);
  return isArray(hasNoInResponse) ? hasNoInResponse.length > 0 : false;
};

export const scheduleCheckIn = (callURL, message, patientName, res, next) =>
  axios
    .post(callURL, {
      chat_id: message.chat.id,
      text:
        // eslint-disable-next-line max-len
        `🤖: Hello ${patientName}, just wanted to check in! It's been ${config.get(
          'application.hapiFhir.checkBackInTime',
        )} ${config.get(
          'application.hapiFhir.checkBackDuration',
        )}, have you checked your blood glucose levels yet? If so, please enter the glucose level. If you need more time to do so, please say "No, I haven't yet".`,
    })
    .then(response => {
      winstonLogger.log(`Message posted: ${response}`);
      res.end('ok');
      next();
    })
    .catch(err => {
      winstonLogger.error('Error :', err);
      res.end(`Error :${err}`);
    });

export const cleanseString = (stringToClean, cleansingRegex) =>
  stringToClean.replace(cleansingRegex, '');

export default { hasNoResponse, scheduleCheckIn };
