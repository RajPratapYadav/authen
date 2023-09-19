const express = require('express');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const passport = require('passport');

class UserRouter {
    constructor() {
        this.router = express.Router();
        this.userModel = new UserModel();

        this.router.post('/login', this.login.bind(this));
        this.router.post('/signup', this.signup.bind(this));
        this.router.get('/resetPassword', this.renderResetPassword.bind(this));
        this.router.post('/resetPassword', this.handleResetPassword.bind(this));
// Google OAuth login route
this.router.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'] })
);
this.router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful Google OAuth authentication
        res.redirect('/home'); // Redirect to the home page or any desired page
    }
);

    }

    async login(req, res) {
        const { email, password } = req.body;

        try {
            console.log('Email:', email);
            console.log('Password:', password);
            
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password:', hashedPassword);

            const user = await this.userModel.findByEmail(email);
            // After the findByEmail method
            console.log('User:', user);

            if (!user) {
                return res.status(401).json({ message: 'Email not found. Please sign up.' });
            }

            const passwordMatch = await bcrypt.compare(hashedPassword, user.password);

            if (passwordMatch) {
                return res.status(200).json({ message: 'Login successful' });
            } else {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Render the reset password form
    renderResetPassword(req, res) {
        res.render('resetPassword.ejs');
    }

    async signup(req, res) {
        const { email, password } = req.body;

        try {
            const existingUser = await this.userModel.findByEmail(email);

            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists. Please choose another.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await this.userModel.createUser(email, hashedPassword);

            return res.status(201).json({ message: 'Signup successful' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async handleResetPassword(req, res) {
        const { newPassword, confirmPassword,email } = req.body;
    
        // Check if the passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
    
        try {
            // Hash the new password before saving it to the database
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log(`Password updated for email: `);

            // Update the user's password in the database based on their email
            await this.userModel.updatePasswordByEmail(email, hashedPassword);
    
            // Log success and return a response
            console.log(`Password updated for email: ${email}`);
            return res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            console.error(error,newPassword,confirmPassword);
            res.status(500).json({ message: error });
        }
    }
    
    
}

module.exports = UserRouter;
