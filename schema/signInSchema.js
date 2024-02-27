const signInSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 1 }, 
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        token: { type: "string" },
        userId: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

module.exports = { signInSchema };
