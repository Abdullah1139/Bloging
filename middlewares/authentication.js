import { validateToken } from "../services/Authentication.js";
export function checkForAuthenticationCookie(cookieName) {
    return function (req, res, next) {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
            next(); // ✅ only call next after successful token validation
        } catch (error) {
            console.error('Token validation error:', error);
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}

export function populateUser(cookieName) {
    return function (req, res, next) {
      const token = req.cookies[cookieName];
      if (!token) return next();
  
      try {
        const user = validateToken(token);
        req.user = user;
        res.locals.user = user; // So you can use in EJS directly
      } catch (err) {
        console.error('Invalid token:', err.message);
      }
  
      next();
    };
  }


export function requireAuth(cookieName) {
  return function (req, res, next) {
    const token = req.cookies[cookieName];
    if (!token) return res.redirect('/user/signin');

    try {
      const user = validateToken(token);
      req.user = user;
      res.locals.user = user;
      next();
    } catch (err) {
      return res.redirect('/user/signin');
    }
  };
}
