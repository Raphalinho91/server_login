const User = require("../../models/user/User");
const jwt = require("jsonwebtoken");

const getUserInfo = async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
  
      if (!authHeader) {
        return reply
          .status(401)
          .send({ message: "Authorization header missing" });
      }
  
      const token = authHeader.split("Bearer ")[1];
  
      if (!token) {
        return reply.status(401).send({ message: "Bearer token missing" });
      }
  
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  
      const userId = decodedToken.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }
  
      request.user = user;
      } catch (error) {
      console.error("Error during token verification:", error);
      return reply.status(401).send({ message: "Invalid token" });
    }
};

module.exports = { getUserInfo }