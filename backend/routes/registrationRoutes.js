import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';

const router = express.Router();

// @route   POST /api/registration/submit
// @desc    Submit registration form
// @access  Public
router.post('/submit', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('job').trim().notEmpty().withMessage('Job is required'),
    body('jobLocation').trim().notEmpty().withMessage('Job location is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('circle').trim().notEmpty().withMessage('Circle is required'),
    body('paymentId').trim().notEmpty().withMessage('Payment ID is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, phone, job, jobLocation, address, circle, paymentId, paymentScreenshot } = req.body;

        // Insert registration into database
        const result = await pool.query(
            `INSERT INTO registrations 
       (name, phone, job, job_location, address, circle, payment_id, payment_screenshot, submitted_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
            [name, phone, job, jobLocation, address, circle, paymentId, paymentScreenshot || null]
        );

        const registration = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully',
            data: {
                id: registration.id,
                name: registration.name,
                submittedAt: registration.submitted_at
            }
        });

    } catch (error) {
        console.error('Registration submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting registration'
        });
    }
});

// @route   GET /api/registration/verify/:paymentId
// @desc    Verify if payment ID already exists
// @access  Public
router.get('/verify/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const result = await pool.query(
            'SELECT id FROM registrations WHERE payment_id = $1',
            [paymentId]
        );

        res.json({
            success: true,
            exists: result.rows.length > 0
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
});

export default router;
