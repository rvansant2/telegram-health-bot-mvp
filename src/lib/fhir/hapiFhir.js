import config from 'config';
import axios from 'axios';

const observationSchema = require('../../fhirSchemas/observation.json');

// eslint-disable-next-line max-statements
export const postObservation = async (patientId, observationValue) => {
  if (!patientId || !observationValue) {
    return new Error('Error postObsevation: Invalid data provided.');
  }
  try {
    const fhirURL = config.get('application.hapiFhir.baseURL');
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
      url: `${fhirURL}/Observation`,
    };
    return axios(options)
      .then(async response => {
        const fhirResponse = await response.data;
        return fhirResponse;
      })
      .catch(err => err);
  } catch (e) {
    throw new Error('postObservation: bad request.');
  }
};

export default { postObservation };
