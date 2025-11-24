import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id, username) => {
    return jwt.sign(
        { id, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @route   POST /api/admin/login
// @desc    Admin login (hardcoded credentials only)
// @access  Public
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = generateToken('hardcoded_admin', username);
            return res.json({
                success: true,
                message: 'Login successful',
                token,
                admin: { username }
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/admin/forms
// @desc    Get all registration forms
// @access  Private
router.get('/forms', protect, async (req, res) => {
    try {
        const { search, searchBy, circle, dateFrom, dateTo, page = 1, limit = 100 } = req.query;

        let query = 'SELECT * FROM registrations WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (search && searchBy) {
            if (searchBy === 'name') {
                query += ` AND name ILIKE $${paramCount}`;
                params.push(`%${search}%`);
                paramCount++;
            } else if (searchBy === 'phone') {
                query += ` AND phone ILIKE $${paramCount}`;
                params.push(`%${search}%`);
                paramCount++;
            }
        }

        if (circle) {
            query += ` AND circle ILIKE $${paramCount}`;
            params.push(`%${circle}%`);
            paramCount++;
        }

        if (dateFrom) {
            query += ` AND submitted_at >= $${paramCount}`;
            params.push(dateFrom);
            paramCount++;
        }

        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            query += ` AND submitted_at <= $${paramCount}`;
            params.push(endDate.toISOString());
            paramCount++;
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY submitted_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, (page - 1) * limit);

        const result = await pool.query(query, params);

        const registrations = result.rows.map(row => ({
            _id: row.id,
            name: row.name,
            phone: row.phone,
            job: row.job,
            jobLocation: row.job_location,
            address: row.address,
            circle: row.circle,
            paymentId: row.payment_id,
            paymentScreenshot: row.payment_screenshot,
            submittedAt: row.submitted_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        res.json({
            success: true,
            count: registrations.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: registrations
        });
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registration forms'
        });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM registrations');
        const total = parseInt(totalResult.rows[0].count);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayResult = await pool.query(
            'SELECT COUNT(*) FROM registrations WHERE submitted_at >= $1',
            [todayStart.toISOString()]
        );
        const today = parseInt(todayResult.rows[0].count);

        const circleResult = await pool.query(`
      SELECT circle as _id, COUNT(*) as count
      FROM registrations
      GROUP BY circle
      ORDER BY count DESC
    `);

        res.json({
            success: true,
            data: {
                total,
                today,
                byCircle: circleResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   DELETE /api/admin/forms/:id
// @desc    Delete a registration entry
// @access  Private
router.delete('/forms/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM registrations WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting registration'
        });
    }
});

export default router;
