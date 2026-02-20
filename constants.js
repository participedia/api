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
  {
    twoLetterCode: "nl",
    name: "Dutch",
  },
];

const TRANSLATION_LLM_SUPPORTED_LANGUAGES = [
  { twoLetterCode: "ar", name: "Arabic" },
  { twoLetterCode: "bn", name: "Bengali" },
  { twoLetterCode: "bg", name: "Bulgarian" },
  { twoLetterCode: "ca", name: "Catalan" },
  { twoLetterCode: "zh-CN", name: "Chinese (Simplified)" },
  { twoLetterCode: "hr", name: "Croatian" },
  { twoLetterCode: "cs", name: "Czech" },
  { twoLetterCode: "da", name: "Danish" },
  { twoLetterCode: "nl", name: "Dutch" },
  { twoLetterCode: "en", name: "English" },
  { twoLetterCode: "et", name: "Estonian" },
  { twoLetterCode: "fi", name: "Finnish" },
  { twoLetterCode: "fr", name: "French" },
  { twoLetterCode: "de", name: "German" },
  { twoLetterCode: "el", name: "Greek" },
  { twoLetterCode: "gu", name: "Gujarati" },
  { twoLetterCode: "he", name: "Hebrew" },
  { twoLetterCode: "hi", name: "Hindi" },
  { twoLetterCode: "hu", name: "Hungarian" },
  { twoLetterCode: "is", name: "Icelandic" },
  { twoLetterCode: "id", name: "Indonesian" },
  { twoLetterCode: "it", name: "Italian" },
  { twoLetterCode: "ja", name: "Japanese" },
  { twoLetterCode: "kn", name: "Kannada" },
  { twoLetterCode: "ko", name: "Korean" },
  { twoLetterCode: "lv", name: "Latvian" },
  { twoLetterCode: "lt", name: "Lithuanian" },
  { twoLetterCode: "ml", name: "Malayalam" },
  { twoLetterCode: "mr", name: "Marathi" },
  { twoLetterCode: "no", name: "Norwegian" },
  { twoLetterCode: "fa", name: "Persian" },
  { twoLetterCode: "pl", name: "Polish" },
  { twoLetterCode: "pt", name: "Portuguese" },
  { twoLetterCode: "pa", name: "Punjabi" },
  { twoLetterCode: "ro", name: "Romanian" },
  { twoLetterCode: "ru", name: "Russian" },
  { twoLetterCode: "sk", name: "Slovak" },
  { twoLetterCode: "sl", name: "Slovenian" },
  { twoLetterCode: "es", name: "Spanish" },
  { twoLetterCode: "sw", name: "Swahili" },
  { twoLetterCode: "sv", name: "Swedish" },
  { twoLetterCode: "ta", name: "Tamil" },
  { twoLetterCode: "te", name: "Telugu" },
  { twoLetterCode: "th", name: "Thai" },
  { twoLetterCode: "tr", name: "Turkish" },
  { twoLetterCode: "uk", name: "Ukrainian" },
  { twoLetterCode: "ur", name: "Urdu" },
  { twoLetterCode: "vi", name: "Vietnamese" },
  { twoLetterCode: "zu", name: "Zulu" },
];

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const RESPONSE_LIMIT = 20;

module.exports = {
  SUPPORTED_LANGUAGES,
  TRANSLATION_LLM_SUPPORTED_LANGUAGES,
  ALLOWED_IMAGE_TYPES,
  RESPONSE_LIMIT,
};
