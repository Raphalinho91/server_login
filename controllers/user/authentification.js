const bcrypt = require("bcrypt");
const User = require("../../models/user/User");
const UserVerification = require("../../models/user/UserVerification");
const nodemailer = require("nodemailer");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const UserToken = require("../../models/user/UserToken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

function generateUniqueToken() {
  return uuid.v4();
}

function generateVerificationCode() {
  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
    console.error("Erreur lors de l'envoi de l'e-mail de vérification :", error);
    throw error;
  }
}

async function verifyEmailCode(request, reply) {
  try {
    const { email, code } = request.body;

    // Rechercher l'utilisateur par son adresse e-mail
    const existingUser = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (!existingUser) {
      return reply.status(404).send({ error: "Utilisateur introuvable" });
    }

    // Rechercher le code de vérification associé à l'utilisateur
    const userVerification = await UserVerification.findOne({
      userId: existingUser._id,
      email,
      code,
    });

    // Vérifier si le code est correct
    if (!userVerification) {
      return reply.status(401).send({ error: "Code de vérification invalide" });
    }

    // Mettre à jour le statut de vérification de l'e-mail de l'utilisateur
    existingUser.emailVerified = true;
    await existingUser.save();

    // Supprimer l'enregistrement de UserVerification une fois l'e-mail vérifié
    await UserVerification.deleteOne({ _id: userVerification._id });

    return reply.status(200).send({ message: "L'email a été vérifiée avec succès" });
  } catch (error) {
    console.error("Erreur durant la vérification de l'email :", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

async function signUp(request, reply) {
  try {
    const { firstName, lastName, email, password, dateOfBirth } = request.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.status(409).send({ error: "Utilisateur déjà existant" });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      verificationToken: generateUniqueToken(),
      emailVerified: false,
    });

    // Sauvegarder l'utilisateur dans la base de données
    await newUser.save();

    // Créer une instance de UserVerification
    const userVerification = new UserVerification({
      userId: newUser._id,
      email: newUser.email,
      code: generateVerificationCode(),
    });

    // Sauvegarder l'instance dans la base de données
    await userVerification.save();

    // Envoyer le code de vérification par e-mail
    await sendVerificationEmail(newUser.email, userVerification.code);

    return reply.status(201).send({ userId: newUser._id });
  } catch (error) {
    console.error("Erreur durant l'inscription :", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

async function signIn(request, reply) {
  try {
    const { email, password } = request.body;

    // Rechercher l'utilisateur par son adresse e-mail
    const existingUser = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (!existingUser) {
      return reply.status(404).send({ error: "Utilisateur introuvable" });
    }

    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Le mots de passe est introuvable" });
    }

    // Vérifier si l'e-mail de l'utilisateur est vérifié
    if (!existingUser.emailVerified) {
      return reply.status(401).send({
        error:
          "L'email n'est pas vérifiée. S'il te plait vérifiez votre mail avant de vous connectez.",
      });
    }

    // Créer un token JWT avec une expiration de 2 heures (en secondes)
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Ajouter le token aux en-têtes de la réponse
    reply.header("Authorization", `Bearer ${token}`);

    // Renvoyer d'autres informations si nécessaire
    return reply.status(200).send({ token, userId: existingUser._id });
  } catch (error) {
    console.error("Erreur durant la connection :", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

async function forgotPassword(request, reply) {
  try {
    const { email } = request.body;

    // Rechercher l'utilisateur par son adresse e-mail
    const existingUser = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (!existingUser) {
      return reply.status(404).send({ error: "Utilisateur introuvable" });
    }

    // Générer un nouveau code de vérification
    const verificationCode = generateVerificationCode();

    // Enregistrer le code de vérification dans la base de données
    const userVerification = new UserVerification({
      userId: existingUser._id,
      email: existingUser.email,
      code: verificationCode,
    });
    await userVerification.save();

    // Envoyer le code de vérification par e-mail
    await sendVerificationEmail(existingUser.email, verificationCode);

    return reply
      .status(200)
      .send({ message: "Le code de vérification a été envoyée avec succès" });
  } catch (error) {
    console.error("Erreur durant l'envoi du mail :", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

async function verifyResetCode(request, reply) {
    try {
      const { email, code } = request.body;
  
      // Rechercher l'utilisateur par son adresse e-mail
      const existingUser = await User.findOne({ email });
  
      // Vérifier si l'utilisateur existe
      if (!existingUser) {
        return reply.status(404).send({ error: "Utilisateur introuvable" });
      }
  
      // Rechercher le code de vérification associé à l'utilisateur
      const userVerification = await UserVerification.findOne({
        userId: existingUser._id,
        email,
        code,
      });
  
      // Vérifier si le code est correct
      if (!userVerification) {
        return reply.status(401).send({ error: "Code de vérification invalide" });
      }
  
      // Supprimer l'enregistrement de UserVerification une fois le code vérifié
      await UserVerification.deleteOne({ _id: userVerification._id });
  
      // Générer un token JWT d'autorisation pour permettre la réinitialisation du mot de passe
      const resetToken = jwt.sign(
        { userId: existingUser._id, email: existingUser.email }, // Ajouter l'e-mail ici
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );
  
      // Enregistrez le token dans la collection UserToken
      const userToken = new UserToken({
        userId: existingUser._id,
        email: existingUser.email,
        token: resetToken,
      });
      await userToken.save();
  
      // Ajouter le token aux en-têtes de la réponse
      reply.header("Authorization", `Bearer ${resetToken}`);
  
      return reply.status(200).send({ message: "Le code de vérification est valide", resetToken });
    } catch (error) {
      console.error("Error during verifyResetCode:", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
}  

async function updatePassword(request, reply) {
    try {
      const { newPassword, confirmPassword } = request.body;
  
      // Vérifier si le mot de passe et la confirmation correspondent
      if (newPassword !== confirmPassword) {
        return reply.status(400).send({ error: "Le mots de passe n'est pas le même" });
      }
  
      // Récupérer le token de l'en-tête
      const token = request.headers.authorization.replace("Bearer ", "");
  
      // Vérifier le token dans la collection UserToken
      console.log("Token:", token);
      const userToken = await UserToken.findOne({ token });
      console.log("UserToken:", userToken);
  
      if (!userToken) {
        return reply.status(401).send({ error: "Le token est invalide ou a expiré" });
      }
  
      // Vérifier si l'utilisateur associé au token existe
      console.log("UserToken:", userToken);
      console.log("Existing User ID:", userToken.userId);
      const existingUser = await User.findOne({ _id: userToken.userId });
      console.log("Existing User:", existingUser);
  
      if (!existingUser) {
        return reply.status(404).send({ error: "Utilisateur déjà existant" });
      }
  
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Mettre à jour le mot de passe de l'utilisateur
      existingUser.password = hashedPassword;
      await existingUser.save();
  
      // Supprimer le token de la collection UserToken après utilisation
      await UserToken.deleteOne({ _id: userToken._id });
  
      return reply.status(200).send({ message: "Le mots de passe a été modifié avec succès" });
    } catch (error) {
      console.error("Erreur durant la modification du mots de passe  :", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
}  

module.exports = {
  signUp,
  signIn,
  sendVerificationEmail,
  verifyEmailCode,
  forgotPassword,
  verifyResetCode,
  updatePassword,
};
