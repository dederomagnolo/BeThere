// middleware intercepta a request para checar se é válida
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) // verifica se existe token
        return res.status(401).send({ error: "No token provided!"});
    
    //Verificar se o formato é valido: Bearer <hash>
    const parts = authHeader.split(' ');

    if(!parts.length === 2)
        return res.status(401).send({ error: "Invalid token!"});
    
        const [ scheme, token ] = parts;
    
    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({ erorr: "Token malformatted!"});

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) return res.status(401).send({ error: 'Invalid token!'});
        
        req.userId = decoded.id;
        return next();
    });
};

// next é chamado só se o user está pronto pra ir pro controller.