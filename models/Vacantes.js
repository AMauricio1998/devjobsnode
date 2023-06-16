const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortId = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: ' El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubucacion es obligatoria'
    },
    salario: {
        type: String,
        default: 0
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url : {
        type: String,
        lowercase:true
    },
    slug: {
        type: String,
        lowercase: true
    }, 
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
})

vacantesSchema.pre('save', function(next) {

    //crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortId.generate()}`;

    next()
});

//Crear indice
vacantesSchema.index({ titulo: 'text'})
module.exports = mongoose.model('Vacantes', vacantesSchema);