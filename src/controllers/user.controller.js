import User from '../models/user.model.js';
import { handleHttpError } from '../utils/handleError.js';
import notificationService from '../services/notification.service.js';
import { encrypt } from '../utils/handlePassword.js';
import { tokenSign, tokenSignRefresh } from '../utils/handleJwt.js';


const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email, status: 'verified' });

        if (existingUser) {
            handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 409);
            return;
        }

        const hashedPassword = await encrypt(password);

        const verificationCode = generateVerificationCode();

        const user = await User.create({
            email,
            password: hashedPassword,
            verificationCode,
            verificationAttempts: 3,
            role: 'admin',
            status: 'pending'
        })

        const accessToken = tokenSign(user);
        const refreshToken = tokenSignRefresh(user);

        user.refreshToken = refreshToken;
        await user.save();

        notificationService.emit('user:registered', user);

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        handleHttpError(res, 'ERROR_REGISTER_USER', 500);
    }
}