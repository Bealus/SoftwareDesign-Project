const express = require('express');
const app = express();
const port = 3000;
const path = require('path')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//app.use(express.static('public')); // 'public' is the directory where your static files (including CSS) are located

// In-memory storage for registered users (You should use a database in a real application)
const users = [];
// users - add other details on push register, bool compltedProfile = false;, database different
app.get('/register', (req, res) => {
    //res.sendFile(__dirname + '/register.html');
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password ) {
        res.status(400).send('All fields are required');
      } else if (password.length < 6) {
        res.status(400).send('Password must be at least 6 characters long');
      }else if (users.some(user => user.username === username)) {
        res.status(400).send('Username already taken. Please choose another one.');
    } else {
        const newUser = {
            username,
            password,
            isProfileCompleted: false,
        };
        // Save the user in memory (In a real application, you would use a database)
        users.push(newUser);

        // Redirect to a login page or another page
        res.redirect('/login');
        //res.redirect('/profile');
        //res.status(200).sendFile(path.join(__dirname, 'login.html'));
    }
});

app.get('/login', (req, res) => {
    //res.sendFile(__dirname + '/login.html');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
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
        res.send('Invalid username or password');
    }
});

app.get('/quote', (req, res) => {
    //res.sendFile(__dirname + '/Fuel-Quote-Form.html');
    res.sendFile(path.join(__dirname, 'Fuel-Quote-Form.html'));
});


app.get('/profile', (req, res) => {
    //res.sendFile(__dirname + '/complete-profile.html');
    res.sendFile(path.join(__dirname, 'complete-profile.html'));
});
//implement post save profile attributes to database or array then send them to quote

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});