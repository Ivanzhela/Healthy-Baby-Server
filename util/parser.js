function parseError(error, res) {
    console.log(error);
    if(error.name == 'ValidationError') {
        res.status(403).json(Object.values(error.errors).map(v => v.message));
    } else {
        res.status(403).json({[error.cause]: error.message});
    }
};

module.exports = {
    parseError
};