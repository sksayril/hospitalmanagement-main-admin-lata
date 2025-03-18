const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function verifyToken(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.header("Authorization");

        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Extract token (remove 'Bearer ' prefix if present)
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;

        let decoded; // ✅ Define `decoded` before using it

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            }
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired"
                });
            }
            return res.status(500).json({
                success: false,
                message: "Internal error while verifying token"
            });
        }

        // Ensure decoded is not undefined
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }

        // Fetch user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Token is invalid."
            });
        }

        // Attach user data to request
        req.user = {
            userId: user._id,
        };

        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication"
        });
    }
}

module.exports = verifyToken;
