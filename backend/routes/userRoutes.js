const express = require('express'); // Import Express
const router = express.Router(); // Initialize router
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT after successful login
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expiration time
    });

    // Include user data in the response
    res.status(200).json({ 
        message: 'Login successful', 
        token, 
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email // Include email if needed
        } 
    }); // Return the user data
});

// Logout route (if needed)
router.post('/logout', (req, res) => {
    // For JWT, logout is typically handled on the client side (clear the token)
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router; // Export the router