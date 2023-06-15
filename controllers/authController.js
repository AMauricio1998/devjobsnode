const mongoose = require('mongoose');
const passport = require('passport');
const Vacante = mongoose.model('Vacantes');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = async (req, res, next) => {

    //Consultar usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        tagline: 'Crea y administra tus vacantes desde aquí',
        vacantes,
        cerrarSesion: true,
        imagen: req.user.imagen,
        nombre: req.user.nombre
    })
}
exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('correcto', 'Cerraste Sesión Correctamente')
        return res.redirect('/iniciar-sesion')
    });
}