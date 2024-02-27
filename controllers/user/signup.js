const uuid = require("uuid");
const User = require("../../models/user/User");
const UserVerification = require("../../models/user/UserVerification");
const { sendVerificationEmail } = require("./sendEmail");

function generateUniqueToken() {
    return uuid.v4();
}

function generateVerificationCode() {
    const length = 6;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
  
    return code;
}

async function signUp(request, reply) {
    try {
      const { firstName, lastName, email, password } = request.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return reply.status(409).send({ message: "Utilisateur déjà existant" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verificationToken: generateUniqueToken(),
        emailVerified: false,
      });
  
      await newUser.save();
  
      const userVerification = new UserVerification({
        userId: newUser._id,
        email: newUser.email,
        code: generateVerificationCode(),
      });
  
      await userVerification.save();
      await sendVerificationEmail(newUser.email, userVerification.code);
  
      return reply
        .status(201)
        .send({ userId: newUser._id, email: newUser.email });
    } catch (error) {
      console.error("Erreur durant l'inscription :", error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
}

module.exports = { signUp }