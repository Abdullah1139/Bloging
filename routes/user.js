import {Router} from 'express';
import User from '../models/user.js';

const router = Router();

router.get('/signin', (req, res) => {
    res.render('signin');
}

);

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('signup', { error: 'User already exists' }); // use render, not send
    }

    const user = new User({ name, email });
    user.setPassword(password);

    await user.save();

    return res.redirect('/user/signin');
  } catch (err) {
    console.error(err);
    return res.status(500).render('signup', { error: 'Something went wrong' });
  }
});


router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie("token", token).redirect('/');
  } catch (err) {
    console.error(err.message);
    return res.render('signin', { error: 'Invalid email or password' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token').redirect('/');
});
  

export default router;