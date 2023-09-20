// users.js, SIMULATING LOGIN ONLY FOR ASSIGMENT #2
// Initialize the registeredUsers object from localStorage if it exists
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};

// You can add some initial users for testing
registeredUsers['user1'] = 'password1';
registeredUsers['user2'] = 'password2';

// Function to save the updated registeredUsers object to localStorage
function saveRegisteredUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}
