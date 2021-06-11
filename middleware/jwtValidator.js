const expressJwt = require('express-jwt');

const authJwt = () => {
  const secret = process.env.JWT_SECRET;
  const API_URL = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/i, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/products(.*)/i, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/i, methods: ['GET', 'OPTIONS'] },
      `${API_URL}/users/register`,
      `${API_URL}/users/login`,
    ],
  });
};

const isRevoked = async (req, payload, done) => {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
};

module.exports = authJwt;
