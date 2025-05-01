import { Schema, model } from 'mongoose';
import { createHmac, randomBytes } from 'crypto';
import { createTokenForUser } from '../services/Authentication.js';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: "../public/images/default.png" },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
}, { timestamps: true });

userSchema.methods.setPassword = function (plainPassword) {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = createHmac('sha256', salt)
    .update(plainPassword)
    .digest('hex');

  this.password = hashedPassword;
  this.salt = salt;
};

userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found');
  
    const hashedInput = createHmac('sha256', user.salt)
      .update(password)
      .digest('hex');
  
    if (hashedInput !== user.password) {
      throw new Error('Invalid password');
    }
    const token = createTokenForUser(user);
    return token;
    // You can return a sanitized user object or the whole user
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.salt;
    return userObj;
  };
  

const User = model('User', userSchema);
export default User;
