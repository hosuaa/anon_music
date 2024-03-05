const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/users', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
    console.error(err);
});

// Define Pin schema and model
const pinSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    name: String,
    user: String,
});

const Pin = mongoose.model('Pin', pinSchema);

app.use(bodyParser.json());

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Use session to keep track of login status
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Use connect-flash middleware
app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static('public'));

// Passport local strategy for username/password login
passport.use(new LocalStrategy(
    (username, password, done) => {
        // Find the user by username in the database
        User.findOne({ username: username })
            .exec()  // Use exec to execute the query
            .then((user) => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username' });
                }

                // Compare the entered password with the hashed password stored in the database
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return done(err);
                    }

                    if (result) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password' });
                    }
                });
            })
            .catch((err) => {
                return done(err);
            });
    }
));


// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // For simplicity, find the user by id from an array of users
    User.findById(id)
    .then(user => {
        done(null, user);
    })
    .catch(err => {
        done(err);
    });

});

// Route for user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username: username,
            password: hashedPassword,
        });

        // Save the user to the database using async/await
        await newUser.save();

        res.redirect('/login'); // Redirect to the login page after registration
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}));

// Route for profile
app.get('/profile', (req, res) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/public/profile.html');
    } else {
        res.redirect('/login');
    }
});

// Add a route for the login page
app.get('/login', (req, res) => {
    // Render the login page
    res.sendFile(__dirname + '/public/login.html');
});

// Route to get user status
app.get('/user/status', (req, res) => {
    if (req.isAuthenticated()) {
        // If a user is authenticated, send their username
        res.json({ username: req.user.username });
    } else {
        // If no user is authenticated, send null
        res.json({ username: null });
    }
});

// Route to handle user logout
app.post('/user/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ username: null }); // Send updated user status (null means not logged in)
    });
});

// Route to get all pins
app.get('/pins', async (req, res) => {
    try {
        const pins = await Pin.find();
        res.json(pins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to add a pin
app.post('/pins', async (req, res) => {
    const { lat, lng, name, user } = req.body;

    try {
        const newPin = new Pin({ lat, lng, name, user });
        await newPin.save();
        res.json(newPin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

