const express = require('express');
const app = express();
const port = 3000;
const path = require('path')
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const PricingModule = require('./public/pricing-Module.js');



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
    } else if (/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/.test(password)) {
        return res.status(400).send('Invalid characters in the password');
    } else if (username.length > 50) {
        return res.status(400).send('Username is too long');
    }
    else {
        // Check if the username already exists in the database
        try {
            // Check if the username already exists in the database
            const [rows] = await promisePool.query('SELECT * FROM Users WHERE username = ?', [username]);
    
            if (rows.length > 0) {
                return res.status(400).send('Username already taken. Please choose another one.');
            }
    

            // Store hashed password in DB. When user log in password is checked with hashed password in DB to check if same.
            const hashedPassword = await bcrypt.hash(password, 10);

            await promisePool.query('INSERT INTO Users (username, password, profileComplete) VALUES (?, ?, ?)', [
                username,
                hashedPassword,
                isProfileCompleted 
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
    const { username, password } = req.body;

    try {
        // Query the database to get the hashed password for the provided username
        const [rows] = await promisePool.query('SELECT * FROM Users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];

            // Compare the provided password with the hashed password from the database
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Passwords match, store user information in the session
                req.session.user = user; //Token stores user.
                if(user.profileComplete === 0) {
                    res.redirect('/profile');
                } else {
                    res.redirect('/quote');
                }
               
            } else {
                // Passwords do not match, send an invalid message
                res.status(401).send('Invalid username or password');
            }
        } else {
            // User not found in the database, send an invalid message - same msg security risk general
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});


app.get('/quote', (req, res) => {
    
    //Only authenticated users can access the page.
    const user = req.session.user;
    
    if (user) {
        console.log('User:', user); //Testing purpose, Check what user is logged in
        res.sendFile(path.join(__dirname, '/public/Fuel-Quote-Form.html'));
    } else {
        // User is not logged in, redirect to the login page
        res.redirect('/login');
    }

    
});

app.post('/quote', async (req, res) => {
    //Delivery will be from DB
    //req.query
    const userId = req.session.user.id; // Get the user ID from the session
    //const { gallonsRequested, deliveryAddress, deliveryDate, suggestedPrice, totalAmount } = req.body;
    gallonsRequested = req.body.gallonsRequested;
    deliveryAddress = 0; // Search DataBase
    deliveryDate = req.body.deliveryDate;
    suggestedPrice = req.body.suggestedPrice;
    totalAmount = req.body.totalAmount;
    //suggestPrice and totalAmount will be inputed from Price Module.
    //Using current user (token user), access the quote DB and set the userID to that ID, then rest to it. Easy access by ID to get user 
    try {
        // Insert into quote table with the quote information and userID
        await promisePool.query(
            'INSERT INTO FuelQuote (user_id, gallonsRequested, deliveryAddress, deliveryDate, suggestPricePerGallon, totalAmountDue) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, gallonsRequested, deliveryAddress, deliveryDate, suggestedPrice, totalAmount]
        );
        res.redirect('/history');
    } catch (error) {
        console.error('quote insert error:', error);
        res.status(500).send('Internal server error');
    }
	
    
});

// Endpoint for handling the pricing calculation
app.post('/pricing', async (req, res) => {
    const { gallonsRequested, deliveryDate } = req.body;

    // Assume userId is available in the session (replace with your actual authentication logic)
    const userId = req.session.user.id;

    try {
        const result = await promisePool.query(
            'SELECT COALESCE(COUNT(*), 0) AS historyCount FROM FuelQuote WHERE user_id = ?',
            [userId]
        );

        // Extract historyCount from the result
        const historyCount = result[0][0].historyCount;
        //const deliveryAddress = // Only send address1, city, state, zipcode
        const result1 = await promisePool.query(
            'SELECT state FROM UserInformation WHERE user_id = ?',
            [userId]
        );

        // Extract state from the result
        const state_ = result1[0][0].state;

        // Create an instance of PricingModule with the provided data
        const pricingModule = new PricingModule(gallonsRequested, historyCount, state_); // Replace 'TX' with the actual location

        // Calculate suggested price and total amount
        const suggestedPrice = pricingModule.calculateSuggestedPrice();
        const totalAmount = pricingModule.calculateTotal();

       const resultZipCode = await promisePool.query(
            'SELECT zipcode FROM UserInformation WHERE user_id = ?',
            [userId]
        );

        // Extract state from the result
        const zipcode_ = resultZipCode[0][0].zipcode;

        const resultAddress = await promisePool.query(
            'SELECT address1 FROM UserInformation WHERE user_id = ?',
            [userId]
        );

        // Extract state from the result
        const address1_ = resultAddress[0][0].address1;

        const resultCity = await promisePool.query(
            'SELECT city FROM UserInformation WHERE user_id = ?',
            [userId]
        );

        // Extract state from the result
        const city_ = resultCity[0][0].city;

        deliveryAddress = address1_ + ', ' + city_ + ', ' + state_ + ', ' + zipcode_;
    
        // Send the calculated data back to the client
        res.json({
            suggestedPrice: suggestedPrice,
            totalAmount: totalAmount,
            deliveryAddress: deliveryAddress,
        });
    } catch (error) {
        console.error('Pricing calculation error:', error);
        res.status(500).json({ error: 'Internal server error' });
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
            console.log("Access Denied - Profile Completed")
            res.redirect('/quote');
        }
    } else {
        // User is not logged in, redirect to the login page
        console.log("Access Denied - Profile")
        res.redirect('/login');
    }
});

app.post('/profile', async (req, res) => {
    const userId = req.session.user.id; // Get the user ID from the session
    console.log(userId)
    const { fullName, address1, address2, city, state, zipcode } = req.body;
    if (!fullName || !address1 || !city || !state || !zipcode || zipcode.length < 5) {
        res.status(401).send('Invalid Profile: Please provide all required information and ensure the zip code is at least 5 characters long.');
    } 
    else {

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

    }
});



app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, '/public/homepage.html'));
});

app.get('/history', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, '/public/history.html'));
    //POSt is going to call all formquotes and display it
    //- Tabular display of all client quotes in the past. All fields from Fuel Quote are displayed.


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