const express = require('express');
const app = express();
const port = 3000;
const path = require('path')

app.use(express.urlencoded({ extended: true })); // Add this middleware to parse form data
app.use(express.json());
app.use(express.static('public')); // 'public' is the directory where your static files (including CSS) are located

// In-memory storage for registered users (You should use a database in a real application)
const users = [
    {
        username: 'user1',
        password: 'password1',
        isProfileCompleted: false,
    },
    {
        username: 'user2',
        password: 'password2',
        isProfileCompleted: true,
    },
];

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html')); //Sends 200 status code by default.
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    //Missing username or password
    if (!username || !password) {
        res.status(400).send('All fields are required');
    } else if (password.length < 6) {
        res.status(400).send('Password must be at least 6 characters long');
    } else if (users.some(user => user.username === username)) {
        res.status(400).send('Username already taken. Please choose another one.');
    } else {
        //Send data to database
        const newUser = {
            username,
            password,
            isProfileCompleted: false,
        };
        
        // Save the user in memory (In a real application, you would use a database)
        users.push(newUser);
        
        //res.redirect('/login');
        res.status(200).send('Registration successful');
    
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
module.exports = { app, users };