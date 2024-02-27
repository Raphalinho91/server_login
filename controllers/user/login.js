const User = require("../../models/user/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function signIn(request, reply) {
    try {
      const { email, password } = request.body;
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return reply.status(404).send({ message: "Utilisateur introuvable" });
      }
  
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordValid) {
        return reply
          .status(401)
          .send({ message: "Le mot de passe est incorrect" });
      }
  
      if (!existingUser.emailVerified) {
        return reply.status(401).send({
          error:
            "L'e-mail n'est pas vérifié. Veuillez vérifier votre e-mail avant de vous connecter.",
        });
      }
  
      if (existingUser.token) {
        existingUser.token = null;
      }
  
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      existingUser.token = token;
  
      await existingUser.save();
  
      reply.header("Authorization", `Bearer ${token}`);
  
      return reply.status(200).send({ token, userId: existingUser._id });
    } catch (error) {
      console.error("Error during login:", error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
}

module.exports = { signIn }