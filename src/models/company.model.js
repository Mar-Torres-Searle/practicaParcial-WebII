import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            minlength: [3, 'Mínimo 3 caracteres'],
            maxlength: [99, 'Máximo 99 caracteres']
        },
        cif: {
            type: String,
            
            required: [true, 'El cif es requerido'],
            unique: true,
            minlength: [9, 'Mínimo 9 caracteres'],
            maxlength: [9, 'Máximo 9 caracteres'],
            trim: true,
            uppercase: true
        },
        address: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        logo:{
            url: String,
            filename: String
        },
        isFreelance:{
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
      timestamps: true,
      versionKey: false
    }

);

const Company = mongoose.model('Company', companySchema);

export default Company;