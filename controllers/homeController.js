const { default: mongoose } = require("mongoose")
const Vacante = mongoose.model('Vacantes');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find().lean();

    if (!vacantes) return next(); 

    res.render('home', {
        nombrePagina: 'devjobs',
        tagline: 'Encuantra y Publica Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}