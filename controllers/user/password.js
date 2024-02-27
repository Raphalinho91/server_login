const User = require("../../models/user/User");
const UserVerification = require("../../models/user/UserVerification");
const UserToken = require("../../models/user/UserToken");

async function forgotPassword(request, reply) {
  try {
    const { email } = request.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return reply.status(401).send({ message: "Utilisateur introuvable" });
    }

    const verificationCode = generateVerificationCode();
    const userVerification = new UserVerification({
      userId: existingUser._id,
      email: existingUser.email,
      code: verificationCode,
    });
    await userVerification.save();

    await sendVerificationEmail(existingUser.email, verificationCode);

    return reply
      .status(200)
      .send({ message: "Le code de vérification a été envoyée avec succès" });
  } catch (error) {
    console.error("Erreur durant l'envoi du mail :", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

async function verifyResetCode(request, reply) {
  try {
    const { email, code } = request.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return reply.status(404).send({ message: "Utilisateur introuvable" });
    }

    const userVerification = await UserVerification.findOne({
      userId: existingUser._id,
      email,
      code,
    });

    if (!userVerification) {
      return reply
        .status(401)
        .send({ message: "Code de vérification invalide" });
    }

    await UserVerification.deleteOne({ _id: userVerification._id });

    if (existingUser.token) {
      existingUser.token = null;
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    const userToken = new UserToken({
      userId: existingUser._id,
      email: existingUser.email,
      token: token,
    });
    await userToken.save();

    reply.header("Authorization", `Bearer ${token}`);

    return reply
      .status(200)
      .send({ message: "Le code de vérification est valide", token });
  } catch (error) {
    console.error("Error during verifyResetCode:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

async function updatePassword(request, reply) {
  try {
    const { newPassword, confirmPassword } = request.body;

    if (newPassword !== confirmPassword) {
      return reply
        .status(400)
        .send({ message: "Le mots de passe n'est pas le même" });
    }

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

    const userToken = await UserToken.findOne({ token });

    if (!userToken) {
      return reply
        .status(401)
        .send({ message: "Le token est invalide ou a expiré" });
    }

    const existingUser = await User.findOne({ _id: userToken.userId });

    if (!existingUser) {
      return reply.status(404).send({ message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;
    await existingUser.save();

    await UserToken.deleteOne({ _id: userToken._id });

    return reply
      .status(200)
      .send({ message: "Le mots de passe a été modifié avec succès" });
  } catch (error) {
    console.error("Erreur durant la modification du mots de passe  :", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

module.exports = {
  forgotPassword,
  verifyResetCode,
  updatePassword,
};
