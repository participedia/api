const selectedCategoryValues = ['all', 'case', 'method', 'organization', 'collection'];

const {
    as
} = require("../../helpers/db");

const apiErrorHandler = async (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).send({ msg: err.message });
    next(err);
}

const auth = async (req, res, next) => {
    let allowedKeys;
    try {
        allowedKeys = JSON.parse(process.env.ALLOWED_API_KEYS || '[]');
    } catch (e) {
        next(new Error('ALLOWED_API_KEYS is not a valid JSON string'));
        return;
    }
    
    if (!allowedKeys.includes(req.headers.api_key)) {
        return res.status(401).json({
            error: "Invalid Participedia API Key",
        });
    }
    next();
}

const getOriginalLanguageEntry = (request) => {
  try {
    const arr = Object.values(request).filter(x => x.original_language);
    const origLang = arr.length ? arr[0].original_language : 'en';
    return origLang;
  } catch (error) {
    return 'en';
  }
}

module.exports = {
  apiErrorHandler,
  getOriginalLanguageEntry,
  auth
}