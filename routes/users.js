const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../utils/db');

const router = express.Router();

const SECRET_KEY = 'Arijit';

/*
    USER REGISTER
    POST /users/register
*/
router.post('/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_no,
            password,
            address
        } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        const checkQuery = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: 'User already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO users
                (first_name, last_name, email, phone_no, password, address)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertQuery,
                [
                    first_name,
                    last_name,
                    email,
                    phone_no,
                    hashedPassword,
                    address
                ],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            message: 'Failed to register user'
                        });
                    }

                    res.status(201).json({
                        message: 'User registered successfully',
                        user_id: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});


/*
    USER LOGIN
    POST /users/login
*/
router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    const query = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = results[0];

        let passwordValid = false;

        try {
            passwordValid = await bcrypt.compare(
                password,
                user.password
            );
        } catch (error) {
            passwordValid = false;
        }

        // Support old plain-text passwords if any exist
        if (!passwordValid && password === user.password) {
            passwordValid = true;
        }

        if (!passwordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: String(user.user_id),
                email: user.email
            },
            SECRET_KEY,
            {
                expiresIn: '1d'
            }
        );

        res.json({
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    });
});


/*
    USER PROFILE
    GET /users/profile
*/
router.get('/profile', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization token required'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        const userId = decoded.id;

        const query = `
            SELECT
                user_id,
                first_name,
                last_name,
                email,
                phone_no,
                address
            FROM users
            WHERE user_id = ?
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.json(results[0]);
        });
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
});


module.exports = router;