import User from '../models/user.model.js';
import Company from '../models/company.model.js'
import { handleHttpError } from '../utils/handleError.js';
import notificationService from '../services/notification.service.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign, tokenSignRefresh, verifyRefreshToken } from '../utils/handleJwt.js';


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
};

//PUT /api/user/validation

export const validateUser = async (req, res) => {
    try{
        const { code } = req.body;
        const user = req.user;

        if (!user) {
            handleHttpError(res, 'USER_NOT_FOUND', 404);
            return;
        }

        if (user.status === 'verified') {
            handleHttpError(res, 'USER_ALREADY_VERIFIED', 400);
            return;
        }

        if (user.verificationAttempts <= 0) {
            handleHttpError(res, 'NO_ATTEMPTS_LEFT', 429);
            return;
        }

        if (user.verificationCode !== code) {
            user.verificationAttempts -= 1;
            await user.save();

            if (user.verificationAttempts <= 0) {
                handleHttpError(res, 'NO_ATTEMPTS_LEFT', 429);
                return;
            }

            return res.status(400).json({
                error: true,
                message: 'Código incorrecto',
                attemptsLeft: user.verificationAttempts
            });
        }

        user.status = 'verified';
        user.verificationCode = undefined;
        await user.save();

        notificationService.emit('user:verified', user);

        res.status(200).json({
        error: false,
        message: 'Usuario verificado correctamente'
        });

    } catch (error) {
        handleHttpError(res, 'ERROR_USER_VALIDATION', 500);
    }
};

// POST /api/user/login

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email }).select('+password');
    
        if (!user) {
          handleHttpError(res, 'INVALID_CREDENTIALS', 401);
          return;
        }
    
        const isValidPassword = await compare(password, user.password);
    
        if (!isValidPassword) {
          handleHttpError(res, 'INVALID_CREDENTIALS', 401);
          return;
        }
    
        if (user.status !== 'verified') {
          handleHttpError(res, 'USER_NOT_VERIFIED', 401);
          return;
        }
    
        const accessToken = tokenSign(user);
        const refreshToken = tokenSignRefresh(user);
    
        user.refreshToken = refreshToken;
        await user.save();
    
        res.status(200).json({
          error: false,
          message: 'Login correcto',
          data: {
            user: {
              email: user.email,
              status: user.status,
              role: user.role
            },
            accessToken,
            refreshToken
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_LOGIN_USER', 500);
    }
}

// POST /api/user/refresh

export const refreshTokenUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;
    
        const decoded = verifyRefreshToken(refreshToken);
    
        if (!decoded || !decoded._id) {
          handleHttpError(res, 'INVALID_REFRESH_TOKEN', 401);
          return;
        }
    
        const user = await User.findById(decoded._id).select('+refreshToken');
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 401);
          return;
        }
    
        if (!user.refreshToken || user.refreshToken !== refreshToken) {
          handleHttpError(res, 'INVALID_REFRESH_TOKEN', 401);
          return;
        }
    
        const accessToken = tokenSign(user);
        const newRefreshToken = tokenSignRefresh(user);

        user.refreshToken = newRefreshToken;
        await user.save();
    
        res.status(200).json({
          error: false,
          message: 'Tokens renovados correctamente',
          data: {
            accessToken,
            refreshToken: newRefreshToken
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_REFRESH_TOKEN', 500);
    }
}


// POST /api/user/logout

export const logoutUser = async (req, res) => {
    try {
        const user = req.user;
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        user.refreshToken = undefined;
        await user.save();
    
        res.status(200).json({
          error: false,
          message: 'Logout correcto'
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_LOGOUT_USER', 500);
    }
}

// PUT /api/user/register

export const registerDataUser = async (req, res) => {
    try {
        const { name, lastName, nif, address } = req.body;
        const user = req.user;
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        user.name = name;
        user.lastName = lastName;
        user.nif = nif;
        user.address = address;
    
        await user.save();
    
        res.status(200).json({
          error: false,
          message: 'Datos personales actualizados correctamente',
          data: {
            user: {
              email: user.email,
              name: user.name,
              lastName: user.lastName,
              nif: user.nif,
              address: user.address,
              status: user.status,
              role: user.role
            }
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_UPDATE_USER_DATA', 500);
    }
}


// PATCH /api/user/company

export const companyDataUser = async (req, res) => {
    try {
        const user = req.user;
        const { name, cif, address, isFreelance } = req.body;
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        if (!user.name || !user.lastName || !user.nif || !user.address) {
          handleHttpError(res, 'USER_PERSONAL_DATA_REQUIRED', 400);
          return;
        }
    
        // Caso autónomo
        if (isFreelance === true) {
          let company = await Company.findOne({ cif: user.nif });
    
          if (!company) {
            company = await Company.create({
              owner: user._id,
              name: `${user.name} ${user.lastName}`,
              cif: user.nif,
              address: user.address,
              isFreelance: true
            });
          }
    
          user.company = company._id;
          user.role = 'admin';
          await user.save();
    
          res.status(200).json({
            error: false,
            message: 'Compañía de autónomo creada/asignada correctamente',
            data: {
              company
            }
          });
          return;
        }
    
        // Caso empresa normal
        const existingCompany = await Company.findOne({ cif });
    
        if (!existingCompany) {
          const company = await Company.create({
            owner: user._id,
            name,
            cif,
            address,
            isFreelance: false
          });
    
          user.company = company._id;
          user.role = 'admin';
          await user.save();
    
          res.status(201).json({
            error: false,
            message: 'Compañía creada y asignada correctamente',
            data: {
              company
            }
          });
          return;
        }
    
        // Si ya existe, se une y pasa a guest
        user.company = existingCompany._id;
        user.role = 'guest';
        await user.save();
    
        res.status(200).json({
          error: false,
          message: 'Usuario unido a compañía existente',
          data: {
            company: existingCompany
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_UPDATE_COMPANY_DATA', 500);
    }
}


// PATCH /api/user/logo

export const uploadLogo = async (req, res) => {
    try {
        const user = req.user;
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        if (!user.company) {
          handleHttpError(res, 'USER_WITHOUT_COMPANY', 400);
          return;
        }
    
        if (!req.file) {
          handleHttpError(res, 'NO_FILE_UPLOADED', 400);
          return;
        }
    
        const company = await Company.findById(user.company);
    
        if (!company) {
          handleHttpError(res, 'COMPANY_NOT_FOUND', 404);
          return;
        }
    
        company.logo = {
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename
        };
    
        await company.save();
    
        res.status(200).json({
          error: false,
          message: 'Logo subido correctamente',
          data: {
            logo: company.logo
          }
        });

    } catch (error) {
        handleHttpError(res, 'ERROR_UPLOAD_LOGO', 500);
    }
}

// GET /api/user

export const getUser = async(req, res) => {
    try {
        const authUser = req.user;
    
        if (!authUser) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        const user = await User.findById(authUser._id).populate('company');
    
        if (!user) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        res.status(200).json({
          error: false,
          message: 'Usuario obtenido correctamente',
          data: {
            user
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_GET_USER', 500);
    }
}

// POST /api/user/invite

const generateTemporaryPassword = () => {
    return `Temp${Math.floor(100000 + Math.random() * 900000)}!`;
};

export const inviteUser = async (req, res) => {
    try {
        const adminUser = req.user;
        const { email } = req.body;
    
        if (!adminUser) {
          handleHttpError(res, 'USER_NOT_FOUND', 404);
          return;
        }
    
        if (adminUser.role !== 'admin') {
          handleHttpError(res, 'NOT_ALLOWED', 403);
          return;
        }
    
        if (!adminUser.company) {
          handleHttpError(res, 'ADMIN_WITHOUT_COMPANY', 400);
          return;
        }
    
        const existingUser = await User.findOne({ email });
    
        if (existingUser) {
          handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 409);
          return;
        }
    
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await encrypt(temporaryPassword);
        const verificationCode = generateVerificationCode();
    
        const invitedUser = await User.create({
          email,
          password: hashedPassword,
          role: 'guest',
          status: 'pending',
          verificationCode,
          verificationAttempts: 3,
          company: adminUser.company
        });
        

        notificationService.emit('user:invited', invitedUser);
    
        res.status(201).json({
          error: false,
          message: 'Usuario invitado correctamente',
          data: {
            user: {
              email: invitedUser.email,
              role: invitedUser.role,
              status: invitedUser.status,
              company: invitedUser.company
            },
            temporaryPassword
          }
        });
    } catch (error) {
        handleHttpError(res, 'ERROR_INVITE_USER', 500);
    }
}