const express = require('express');
const app = express();
const port = 3000;
const path = require('path')
const mysql = require('mysql2');

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

app.post('/login', (req, res) => {
    //Input from login form stored into username and password.
    const { username, password } = req.body;
    
    // Check if the username and password match any registered user
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        if (user.isProfileCompleted) {
            // User's profile is completed, redirect to the homepage or another page
            res.redirect('/quote'); 
        } else {
            // User's profile is not completed, redirect to the complete profile page
            res.redirect('/profile'); 
        }
    } else {
        res.status(401).send('Invalid username or password');
    }
});

app.get('/quote', (req, res) => {
    //res.sendFile(__dirname + '/Fuel-Quote-Form.html');
    res.sendFile(path.join(__dirname, '/public/Fuel-Quote-Form.html'));
});


app.get('/profile', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, '/public/complete-profile.html'));
});
//implement post save profile attributes to database or array then send them to quote
/*
app.post('/profile', async (req, res) => {
    const { username, fullName, address1, address2, city, state, zipcode } = req.body;
    console.log(fullName);
    try {
        // Assuming the user is already authenticated during the profile update
        // Directly update the user's profile in the database
        const user = await users.findOne({ where: { username } });

        // Update the user's profile in the database
        user.fullName = fullName;
        user.address1 = address1;
        user.address2 = address2;
        user.city = city;
        user.state = state;
        user.zipcode = zipcode;

        // Set isProfileCompleted to true
        user.isProfileCompleted = true;

        // Save the updated user information
        await user.save();

        // Redirect to another page or send a success message
        res.redirect('/quote');
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).send('Internal server error');
    }
});
*/

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
//module.exports = { app, users };