// const {Translate} = require('@google-cloud/translate').v2;
// const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});
const {auth} = require('google-auth-library');
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
}
const authKeys = JSON.parse(keysEnvVar);
const client = auth.fromJSON(authKeys);
client.scopes = ['https://www.googleapis.com/auth/cloud-platform'];

async function translateText(data, targetLanguage) {
  // The text to translate
  const text = data;

  // The target language
  const target = targetLanguage;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_MAPS_API_KEY}&target=${target}&q=${text}`;
  const res = await client.request({url});

  if (res.data.data.translations.length > 0) {
    return res.data.data.translations[0].translatedText;
  }
  return null;
}

async function testTranslate() {
  const newtext = await translateText('Hello World. This is a translation test.', 'th');
  console.log(newtext);
}

testTranslate();