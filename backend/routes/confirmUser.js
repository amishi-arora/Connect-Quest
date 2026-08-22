const { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

async function confirmUser(req, res) {
  const { email } = req.body;
  try {
    await client.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
      })
    );
    res.json({ confirmed: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = confirmUser;