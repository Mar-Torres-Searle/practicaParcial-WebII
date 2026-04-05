import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [8, 'Mínimo 8 caracteres'],
        select: false  // No incluir en consultas por defecto
    },
    name: {
      type: String,
      //required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [3, 'Mínimo 3 caracteres'],
      maxlength: [99, 'Máximo 99 caracteres']
    },
    lastName: {
        type: String,
        //required: [true, 'El apellido es requerido'],
        trim: true,
        minlength: [3, 'Mínimo 3 caracteres'],
        maxlength: [99, 'Máximo 99 caracteres']
    },
    nif: {
      type: String,
      minlength: [9, 'Mínimo 9 caracteres'],
      maxlength: [9, 'Máximo 9 caracteres'],
      trim: true,
      uppercase: true
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin'
    },
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending'
    },
    verificationCode: {
        type: String,
        match: [/^\d{6}$/, 'El código debe tener 6 dígitos']
    },
    verificationAttempts:{
        type: Number,
        default: 3
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    address: {
        street: String,
        number: String,
        postal: String,
        city: String,
        province: String
    },
    deleted: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        select: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

userSchema.virtual('fullName').get(function () {
    return [this.name, this.lastName].filter(Boolean).join(' ');
  });

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;