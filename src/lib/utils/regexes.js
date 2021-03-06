export const REGEX_PATTERNS = {
  NUMERIC_REGEXP: /[-]{0,1}[\d]*[.]{0,1}[\d]+/g,
  // eslint-disable-next-line no-useless-escape
  NO_SPECIAL_CHARS: /[&\/\\#,!+()$~%.'":*?<>{}]/g,
  GLUCOSE_SUBMISSION: /glucose.*?\w+.*?[-]{0,1}[\d]*[.]{0,1}[\d]+/gi,
};

export default { REGEX_PATTERNS };
