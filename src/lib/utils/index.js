const NO_WORD_REGEXP = /no+\W/gi;

export const hasNoResponse = textResponse => {
  const hasNoInResponse = textResponse.match(NO_WORD_REGEXP);
  return hasNoInResponse.length > 0;
};

export default { hasNoResponse };
