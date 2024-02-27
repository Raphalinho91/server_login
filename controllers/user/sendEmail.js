const User = require("../../models/user/User");
const UserVerification = require("../../models/user/UserVerification");
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });
  
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
  
  async function sendVerificationEmail(email, verificationToken) {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Vérification de l'e-mail",
      html: `
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit sur notre plateforme.</p>
        <p>Veuillez utiliser le code suivant pour vérifier votre adresse e-mail : <strong>${verificationToken}</strong></p>
        <p>Cordialement,<br>ShopAll</p>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Un e-mail de vérification a été envoyé à : " + email);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'e-mail de vérification :",
        error
      );
      throw error;
    }
  }
  
  async function sendEmail(request, reply) {
    try {
      const { email } = request.body;
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return reply.status(404).send({ message: "Utilisateur introuvable" });
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
  
  async function verifyEmailCode(request, reply) {
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
  
      existingUser.emailVerified = true;
      await existingUser.save();
      await UserVerification.deleteOne({ _id: userVerification._id });
  
      return reply
        .status(200)
        .send({ message: "L'email a été vérifiée avec succès" });
    } catch (error) {
      console.error("Erreur durant la vérification de l'email :", error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
}

module.exports = { verifyEmailCode, sendEmail, sendVerificationEmail }