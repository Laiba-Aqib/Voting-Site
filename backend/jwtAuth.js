const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const extractedPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = extractedPayload;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const jwtTokenGenerator = (userPayload) => {
    return jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { jwtAuthMiddleware, jwtTokenGenerator };