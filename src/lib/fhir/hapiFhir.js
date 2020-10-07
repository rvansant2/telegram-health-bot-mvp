import config from 'config';
import axios from 'axios';

const observationSchema = require('../../fhirSchemas/observation.json');

const FHIR_URL = config.get('application.hapiFhir.baseURL');

export const getPatient = async patientId => {
  if (!patientId) {
    return new Error('Error getPatient: A patient id is needed.');
  }

  try {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/fhir+json' },
      url: `${FHIR_URL}/Patient/${patientId}`,
    };
    return axios(options)
      .then(async response => {
        const fhirResponse = await response.data;
        return fhirResponse;
      })
      .catch(err => err);
  } catch (e) {
    throw new Error('getPatient: Bad request.');
  }
};

// eslint-disable-next-line max-statements
export const postObservation = async (patientId, observationValue) => {
  if (!patientId || !observationValue) {
    return new Error('Error postObsevation: Invalid data provided.');
  }
  try {
    const currentDate = new Date().toISOString();
    observationSchema.meta.lastUpdated = currentDate;
    observationSchema.subject.reference = `Patient/${patientId}`;
    observationSchema.valueQuantity.value = observationValue;
    observationSchema.effectiveDateTime = currentDate;
    observationSchema.issued = currentDate;
    const json = JSON.stringify(observationSchema);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      data: json,
      url: `${FHIR_URL}/Observation`,
    };
    return axios(options)
      .then(async response => {
        const fhirResponse = await response.data;
        return fhirResponse;
      })
      .catch(err => err);
  } catch (e) {
    throw new Error('postObservation: Bad request.');
  }
};

export default { postObservation, getPatient };
