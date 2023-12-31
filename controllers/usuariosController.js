const mongoose = require('mongoose')
const Usuarios = require("../models/Usuarios")
const multer = require('multer')
const shortid = require('shortid')

exports.subirImagen = (req,res,next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande Maximo 100kb')
                } else {
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message)
            }
            res.redirect('/administracion')
            return
        } else {
            return next()
        }
    })
}

const configuracionMulter = {
    limits : { fileSize : 100000},
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        },
        filename : (req, file, cb) => {
            const extencion = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extencion}`)
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //El callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en Devjobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear tu cuenta'
    })
}

exports.validarRegistro = (req, res, next) => {

    //sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    //Validar
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if(errores) {
        //Si hay errores
        req.flash('error', errores.map(error => error.msg ));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en Devjobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear tu cuenta',
            mensajes: req.flash()
        });
        return;
    }

    //Si toda la validacion es correcta
    next();
}
exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuarios(req.body)

    try {
        const nuevoUsuario = await usuario.save();
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', error)
        res.redirect('/crear-cuenta')
    }
}   
exports.formIniciarSesion = (req, res, next) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión devJobs'
    })
}
exports.formEditarPerfil = (req, res, next) => {    
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user.toJSON(),
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}
exports.editarPerfil = async (req, res, next) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    
    if (req.body.password) {
        usuario.password = req.body.password
    }

    if(req.file) {
        usuario.imagen = req.file.filename
    }

    await usuario.save()

    req.flash('correcto', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')
}

exports.validarPerfil = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }

    // validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        req.flash('error', errores.map(error => error.msg ));

        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user.toJSON(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        })
        return
    }
    next()
}
