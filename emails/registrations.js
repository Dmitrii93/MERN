const keys = require("../keys/index");
module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Registration on courses app",
    html: `
    <h1>Welcome to our store</h1>
    <p>Accaunt is created with email ${email}</p>
    <hr/>
    <a href="${keys.BASE_URL}">Go to store</a>
    `,
  };
};
