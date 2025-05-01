import JWT from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export function createTokenForUser(user) {

    const payload = {
        _id: user._id,
        name:user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
    }; 
    const token = JWT.sign(payload, JWT_SECRET);
    return token;
    }

   export function validateToken(token) {
        try {
            const payload = JWT.verify(token, JWT_SECRET);
            return payload;
        } catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    }
