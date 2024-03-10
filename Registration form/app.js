const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/registrationForm', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('Registration Form'));

app.get('/', (req, res) => {
  const registrationFlag = req.cookies.registrationFlag;

  if (registrationFlag === 'true') {
    res.clearCookie('registrationFlag');
    res.send('You have already registered. Page will not be displayed.');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();

    console.log('User registered:', { username, email });

    res.cookie('registrationFlag', 'true', { maxAge: 900000, httpOnly: true });
    res.clearCookie('registrationFlag').send(`
      <script>
        alert('Registration successful! You can now register a new ID.');
        window.location.href = '/';
      </script>
    `);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Error during registration');
  }
});

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).send('Unexpected error');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
