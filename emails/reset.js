const keys = require("../keys/index");
module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Password Reset",
    html: `
        <h1>You forgot your password?</h1>
        <p>If not, ignore this message</p>
        <p>Else follow the link</p>
        <p><a href="${keys.BASE_URL}/auth/password/${token}">Reset password</a></p>
        <hr/>
        <a href="${keys.BASE_URL}">Go to store</a>
        `,
  };
};
