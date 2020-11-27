const SUPPORTED_LANGUAGES = [
  {
    twoLetterCode: "en",
    name: "English",
  },
  {
    twoLetterCode: "fr",
    name: "French",
  },
  {
    twoLetterCode: "de",
    name: "German",
  },
  {
    twoLetterCode: "es",
    name: "Spanish",
  },
  {
    twoLetterCode: "zh",
    name: "Chinese",
  },
  {
    twoLetterCode: "it",
    name: "Italian",
  },
  {
    twoLetterCode: "pt",
    name: "Portuguese",
  },
];

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const RESPONSE_LIMIT = 20;

module.exports = { SUPPORTED_LANGUAGES, ALLOWED_IMAGE_TYPES };
