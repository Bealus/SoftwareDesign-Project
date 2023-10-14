const request = require('supertest');
const { app, users } = require('../server'); // Update the path to server.js as needed, uses array of users to check.

//UNIT TEST REGISTER
describe('Register get request', () => {
    it('should open page to register.html', async () => {
      const res = await request(app)
        .get('/register')
      expect(res.statusCode).toEqual(200);
    });
    });

describe('POST /register', () => {
    it('new user created success', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'newuser', password: 'newpassword' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Registration successful');
    });

    it('should handle missing username or password', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'newuser' }); // Missing password

        expect(response.status).toBe(400);
        expect(response.text).toBe('All fields are required');
    });

    it('should handle short passwords', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'newuser', password: 'short' }); // Short password

        expect(response.status).toBe(400);
        expect(response.text).toBe('Password must be at least 6 characters long');
    });

    it('should handle duplicate usernames', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'user1', password: 'password1' }); // Username already exists

        expect(response.status).toBe(400);
        expect(response.text).toBe('Username already taken. Please choose another one.');
    });
});


//UNIT TEST LOGIN
describe('Login get request', () => {
    it('should open page to loginPage.html', async () => {
      const res = await request(app)
        .get('/login')
      expect(res.statusCode).toEqual(200);
    });
    });

describe('POST /login', () => {
    it('should log in with valid credentials and a completed profile', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'user2', password: 'password2' });

        expect(response.status).toBe(302); // 302 for redirect
        expect(response.headers.location).toBe('/quote');
    });

    it('should log in with valid credentials and an incomplete profile', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'password1' });

        expect(response.status).toBe(302); // 302 for redirect
        expect(response.headers.location).toBe('/profile');
    });

    it('should not log in with invalid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'invalidUser', password: 'invalidPassword' });

        expect(response.status).toBe(401);
    });
});

//UNIT TEST QUOTE
describe('Quote get request', () => {
    it('should open page to Fuel-Quote-Form.html', async () => {
      const res = await request(app)
        .get('/quote')
      expect(res.statusCode).toEqual(200);
    });
    });

//UNIT TEST PROFILE
describe('Profile get request', () => {
    it('should open page to complete-profile.html', async () => {
      const res = await request(app)
        .get('/profile')
      expect(res.statusCode).toEqual(200);
    });
    });

//UNIT TEST HOMEPAGE
describe('Homepage get request', () => {
    it('should open page to homepage.html', async () => {
      const res = await request(app)
        .get('/') //homepage
      expect(res.statusCode).toEqual(200);
    });
    });

//UNIT TEST HISTORY
describe('History get request', () => {
    it('should open page to history.html', async () => {
      const res = await request(app)
        .get('/history') 
      expect(res.statusCode).toEqual(200);
    });
    });