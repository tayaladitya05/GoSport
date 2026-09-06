const COOKIE_NAME = "accessToken";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: MAX_AGE_MS,
    path: "/",
  };
}

function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
}

function getAccessToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }
  return null;
}

module.exports = {
  COOKIE_NAME,
  cookieOptions,
  clearCookieOptions,
  getAccessToken,
};
