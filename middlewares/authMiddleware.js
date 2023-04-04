const { validateToken } = require('../services/authService');
const { parseError } = require('../util/parser');

exports.auth = (req, res, next) => {
    const token = req.headers['x-authorization'];

    if (token) {

        try {

            const payload = validateToken(token);

            req.user = {
                username: payload.username,
                email: payload.email,
                _id: payload._id,
                token
            };

        } catch (err) {

            parseError(err);
        }
    }
    next();
};
