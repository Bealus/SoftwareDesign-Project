const express = require('express');
const app = express();
const port = 3000;
const path = require('path')
const mysql = require('mysql2');
const session = require('express-session');


require('dotenv').config(); // Load environment variables from .env file

app.use(express.urlencoded({ extended: true })); // Add this middleware to parse form data
app.use(express.json());
app.use(express.static('public')); // 'public' is the directory where your static files (including CSS) are located


// Create a connection pool for a locally installed MySQL server
const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_DATABASE, 
  });
  
  const promisePool = pool.promise();

  promisePool
    .query('SELECT 1')
    .then(() => {
        console.log('Database is connected');
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });

  // Configure express-session middleware
app.use(
    session({
        secret: 'your-secret-key', // Change this to a strong, random value
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // Session duration (in milliseconds), e.g., 24 hours
        },
    })
);
  // Now, you can use `promisePool` to execute queries on your local MySQL server.


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html')); //Sends 200 status code by default.
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    var isProfileCompleted = 0;
    //Missing username or password
    if (!username || !password) {
        res.status(400).send('All fields are required');
    } else if (password.length < 6) {
        res.status(400).send('Password must be at least 6 characters long');
    } else {
        // Check if the username already exists in the database
        try {
            // Check if the username already exists in the database
            const [rows] = await promisePool.query('SELECT * FROM Users WHERE username = ?', [username]);
    
            if (rows.length > 0) {
                return res.status(400).send('Username already taken. Please choose another one.');
            }
    
            // If the username doesn't exist, insert the new user into the database
            await promisePool.query('INSERT INTO Users (username, password, profileComplete) VALUES (?, ?, ?)', [
                username,
                password,
                isProfileCompleted // Assuming the profile is not completed initially
            ]);
    
            return res.status(200).send('Registration successful');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Username already taken. Please choose another one.');
            } else {
                console.error('Error registering the user:', error);
                return res.status(500).send('Internal server error');
            }
        }
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.post('/login', async (req, res) => {
    // Input from the login form stored into username and password.
    const { username, password } = req.body;

    try {
        // Query the database to check if the user exists and their profile status
        const [rows] = await promisePool.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]);

        if (rows.length > 0) {
            const user = rows[0]; // Assuming there's only one user with the same username/password

             // Store user information in the session
             req.session.user = user;
             res.redirect('/profile');
            
        } else {
            // User not found in the database, send an invalid message
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/quote', (req, res) => {
    
    //res.sendFile(path.join(__dirname, '/public/Fuel-Quote-Form.html'));
    const user = req.session.user;
    // Check if the user is logged in (user data is in the session)
    if (user) {
        // Render the quote page
        console.log('User:', user); //Testing purpose, Check what user is logged in
        res.sendFile(path.join(__dirname, '/public/Fuel-Quote-Form.html'));
    } else {
        // User is not logged in, redirect to the login page
        res.redirect('/login');
    }
});


app.get('/profile', async (req, res) => {
    const user = req.session.user;
    
    if (user) {
        // Check if the user is logged in and the profileComplete status
        if (user.profileComplete === 0) {
            // Profile is not complete, redirect to the profile page
            res.sendFile(path.join(__dirname, '/public/complete-profile.html'));
        } else if (user.profileComplete === 1) {
            // Profile is complete, redirect to the quote page
            res.redirect('/quote');
        }
    } else {
        // User is not logged in, redirect to the login page
        res.redirect('/login');
    }
});

app.post('/profile', async (req, res) => {
    const userId = req.session.user.id; // Get the user ID from the session
    const { fullName, address1, address2, city, state, zipcode } = req.body;

    try {
        // Update the userInformation table with the new profile information
        await promisePool.query(
            'INSERT INTO userInformation (user_id, fullName, address1, address2, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, fullName, address1, address2, city, state, zipcode]
        );

        // Set isProfileCompleted to true in the Users table
        await promisePool.query('UPDATE Users SET profileComplete = ? WHERE id = ?', [1, userId]);

        // Redirect to another page or send a success message
        res.redirect('/quote');
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).send('Internal server error');
    }
});



app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, '/public/homepage.html'));
});

app.get('/history', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, '/public/history.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/logout', (req, res) => {
    if (req.session.user) {
        // Log the username of the user who is logging out
        console.log(`User '${req.session.user.username}' is logging out`);
    }
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login'); // Redirect to the login page after logout
    });
});
//module.exports = { app, users };