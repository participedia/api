const apiErrorHandler = async (err, req, res, next) => {
    res.status(500).send({ msg: err.message });
}

module.exports = {
    apiErrorHandler
}