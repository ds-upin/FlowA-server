const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authUser = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    //console.log("1",authHeader);
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    //console.log("2",token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        //console.log("3",decoded);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authUser;