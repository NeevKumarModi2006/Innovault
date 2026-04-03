/**
 * Password Validation Middleware
 * ──────────────────────────────
 * Ensures passwords meet robust security requirements:
 * 1. At least 8 characters
 * 2. 1 uppercase, 1 lowercase, 1 number, 1 special character
 * 3. Does not contain the username or the user's email prefix.
 */

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(req, res, next) {
    const password = req.body.password || req.body.newPassword;
    const { username, email } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    } 

    const errors = [];

    if (password.length < 8) {
        errors.push('be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('contain an uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('contain a lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('contain a number');
    }
    if (!/[@$!%*?&]/.test(password)) {
        errors.push('contain a special character (@$!%*?&)');
    }

    if (errors.length > 0) {
        // e.g., "Password must be at least 8 characters long, contain an uppercase letter."
        return res.status(400).json({ 
            message: `Password must ${errors.join(' and ')}.`
        });
    }

    const lowerPass = password.toLowerCase();

    // Reject if password contains username
    if (username && lowerPass.includes(username.toLowerCase())) {
        return res.status(400).json({ message: 'Password cannot contain your username' });
    }

    // Reject if password contains email prefix
    if (email) {
        const emailPrefix = email.split('@')[0].toLowerCase();
        if (emailPrefix.length >= 3 && lowerPass.includes(emailPrefix)) {
            return res.status(400).json({ message: 'Password cannot contain your email prefix' });
        }
    }

    next();
}

module.exports = validatePassword;
