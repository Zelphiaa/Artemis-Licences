const jwt = require('jsonwebtoken');

let checkAuth = (req, res, next) => {

  // Leer headers
  let token = req.get('token');
  jwt.verify(token, 'SECRETPASSWORDSECRET', (err, decoded) => {

    if(err) {
        console.log(err);
      return res.status(401).json({
        mensaje: 'Error de token',
        err
      })
    }

    // Creamos una nueva propiedad con la info del usuario
    req.userData = decoded.userData; //data viene al generar el token en login.js
    next();

  });

}

const checkAdm = (req, res, next) => {
    const rol = req.userData.rol
    if (rol === 'ADMIN') {
        next()
    } else {
        return res.status(401).json({
            message: 'Invalid rol'
        })
    }
} 


module.exports = {checkAdm, checkAuth}

