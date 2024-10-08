"use strict";
let express = require("express");
let router = express.Router();
const OpenAI = require("openai");
const logError = require("../helpers/log-error.js");

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});


/**
 * TODO
 * add i18n
 */
const openAiErrors = {
  BadRequestError: 'The request could not be processed due to invalid parameters or data.',
  AuthenticationError: 'Authentication failed. Please provide valid credentials.',
  PermissionDeniedError: 'You do not have permission to access this resource.',
  NotFoundError: 'The requested resource could not be found.',
  UnprocessableEntityError: 'The request was well-formed but contains semantic errors. Please correct the request.',
  RateLimitError: "You have exceeded the rate limit for API requests. Please try again later.",
  InternalServerError: "An unexpected error occurred while processing your request. Please try again later.",
  APIConnectionError: "There was a problem connecting to the API. Please check your internet connection and try again."
}

//Handling errors
async function handlingError(req, res, error) {
  if (error instanceof OpenAI.APIError) {
    const code = error.status !== 'N/A' ? error.status : 500;
    const message = openAiErrors.hasOwnProperty(error.name) ? openAiErrors[error.name] : openAiErrors.InternalServerError;
    res.status(code).json({ OK: false, name: error.name, error: message });
  } else {
    res.status(400).json({ OK: false, error: openAiErrors.InternalServerError });
  }
}

router.get("/", async (req, res) => {
  try {
    const results = [];
    // const results = await listRedis(listKey);
    const items = results.map(item => JSON.parse(item)); 
    return res.status(200).render(`chat-ai-list`, { items });
    
  } catch (error) {
    logError(error);
  }
});

router.post("/completions", async function(req, res) {
  try {
    const message = req.body.message;
    if (!req.body.message) {
      return res
        .status(403)
        .json({ error: openAiErrors.BadRequestError });
    }
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `${message}. Reply with data on participedia.net and give some links as examples` }],
      model: 'gpt-3.5-turbo',
    });
    const choice = chatCompletion.choices[0];

    const result = {
      id: chatCompletion.id,
      model: chatCompletion.model,
      object: chatCompletion.object,
      system_fingerprint: chatCompletion.system_fingerprint,
      ...choice,
    };
    

    // data to add to redis
    const currentDate = new Date();
    const dateString = currentDate.toISOString();
    const item = JSON.stringify({question: message, createAt: dateString});
    // push to the list of items
    // addToRedis(item, listKey);

    res.status(200).json({OK: true, data: result});
  } catch (error) {
    handlingError(req, res, error);
  }
});



module.exports = router;
