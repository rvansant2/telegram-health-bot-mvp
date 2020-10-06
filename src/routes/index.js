import express from 'express';
import config from 'config';
import axios from 'axios';

import winstonLogger from '../lib/logger/winston';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const baseJSON = { success: true, message: 'Healthy check!' };
  res.status(200).json(baseJSON);
  next();
});

router.post('/new-message', async (req, res, next) => {
  const telegramURL = config.get('application.telegram.url');
  const { message } = req.body;

  if (!message || message.text.toLowerCase().indexOf('marco') < 0) {
    return res.end();
  }

  return axios
    .post(telegramURL, {
      chat_id: message.chat.id,
      text: 'Polo!!',
    })
    .then(response => {
      winstonLogger.log(`Message posted: ${response}`);
      res.end('ok');
      next();
    })
    .catch(err => {
      // ...and here if it was not
      winstonLogger.error('Error :', err);
      res.end(`Error :${err}`);
    });
});

export default router;
