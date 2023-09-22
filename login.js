// login.js


function simulateLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const message = document.getElementById('login-message');

    // Simulate a login by checking if the username and password match a registered user
    if (registeredUsers[username] === password) {
        // Store the logged-in user's information in localStorage
        localStorage.setItem('loggedInUser', username);
        userProfile = userProfiles[username];

        // Check if the user's profile is incomplete
        if(!userProfile.fullname) {
            window.location.href = 'complete-profile.html'; //Send them to complete profile.
        } else {
            window.location.href = 'Fuel-Quote-Form.html'; //Send them to fuel quote.
        }
       
        return false; // Prevent the form from submitting
    } else {
        message.innerText = 'Invalid username or password';
        message.classList.remove('success-message');
        return false; // Prevent the form from submitting
    }
}