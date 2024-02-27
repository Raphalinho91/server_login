const User = require("../../models/user/User");
const jwt = require("jsonwebtoken");

async function addressePost(request, reply) {
  try {
    const { email, pays, province, ville, codePostale, adresse } = request.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email });
    if (!user) {
      return reply.status(404).send({ message: "Utilisateur introuvable" });
    }

    // Mettre à jour l'adresse de l'utilisateur
    user.pays = pays;
    user.province = province;
    user.ville = ville;
    user.codePostale = codePostale;
    user.adresse = adresse;

    await user.save();

    return reply
      .status(200)
      .send({ success: true, pays, province, ville, codePostale, adresse });
  } catch (error) {
    console.error("Erreur :", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

async function infoPersoPost(request, reply) {
  try {
    const { email, sexe, taille, poids, vetementTaille, pointure } =
      request.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email });
    if (!user) {
      return reply.status(404).send({ message: "Utilisateur introuvable" });
    }

    // Mettre à jour l'adresse de l'utilisateur
    user.sexe = sexe;
    user.taille = taille;
    user.poids = poids;
    user.vetementTaille = vetementTaille;
    user.pointure = pointure;

    await user.save();

    return reply
      .status(200)
      .send({ success: true, sexe, taille, poids, vetementTaille, pointure });
  } catch (error) {
    console.error("Erreur :", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

async function infoBancairePost(request, reply) {
  try {
    const { email, numeroBancaire, dateCarte, cvcCarte } = request.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email });
    if (!user) {
      return reply.status(404).send({ message: "Utilisateur introuvable" });
    }

    // Mettre à jour l'adresse de l'utilisateur
    user.numeroBancaire = numeroBancaire;
    user.dateCarte = dateCarte;
    user.cvcCarte = cvcCarte;

    await user.save();

    return reply
      .status(200)
      .send({ success: true, numeroBancaire, dateCarte, cvcCarte });
  } catch (error) {
    console.error("Erreur :", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

const getUserAdmin = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ message: "Authorization header missing" });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return reply.status(401).send({ message: "Bearer token missing" });
    }

    console.log("Received Token:", token);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const user = await User.findById(userId);

    if (!user) {
      return reply.status(404).send({ message: "Utilisateur introuvable" });
    }

    if (!user.admin) {
      return reply.send({ success: false, message: "Vous n'êtes pas Administrateur !" });
    }

    const users = await User.find({});

    return reply.send({
      success: true,
      message: "Vous êtes Administrateur !",
      user: user,
      users: users
    });
  } catch (error) {
    console.error("Error during token verification:", error);
    return reply.status(401).send({ message: "Erreur" });
  }
};

const getAllUser = async (request, reply) => {
  try {
    const users = await User.find({});

    request.user = users;

    return reply.status(200).send({ success: true, users });
  } catch (error) {
    console.error("Error:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

const deleteOneUser = async (request, reply) => {
  try {
    const userId = request.params.userId;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return reply.status(404).send({ success: false, message: "User not found" });
    } 

    return reply.status(200).send({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  getUserAdmin,
  infoPersoPost,
  addressePost,
  infoBancairePost,
  getAllUser,
  deleteOneUser
};
