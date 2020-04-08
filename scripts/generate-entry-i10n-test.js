// Get google translate credentials
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
  return;
}

const { Translate } = require('@google-cloud/translate').v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys['key'] = process.env.GOOGLE_MAPS_API_KEY;
const translate = new Translate(authKeys);

translateText('Hello World. This is a translation test.', 'th');
async function translateText(data, targetLanguage) {
  // The text to translate
  const text = data;

  // The target language
  const target = targetLanguage;

  const [translation] = await translate.translate(text, target);
  console.log(`Text: ${text}`);
  console.log(`Translation: ${translation}`);
  return translation;
}