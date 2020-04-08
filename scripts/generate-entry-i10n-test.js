const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});
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