import express from 'express';
import config from 'config';
import get from 'lodash/get';

import winstonLogger from '../lib/logger/winston';
import userModel from '../models/userModel';

const router = express.Router();

router.get('/:id?', async (req, res, next) => {
  try {
    const patientId = get(req.params, 'id', config.get('application.hapiFhir.patientId'));
    const user = await userModel
      .findOne({ patientId })
      .populate('glucose')
      .select('-password');

    res.status(200).json({
      user,
      success: true,
      message: `Successfully retrieved user details for patient id: ${patientId}.`,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    winstonLogger.error(`Error: ${e.message}`);
    next();
  }
});

export default router;
