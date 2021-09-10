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

module.exports = {
    apiErrorHandler,
    auth
}