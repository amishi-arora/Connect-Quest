require("dotenv").config();
console.log("AWS key loaded:", process.env.AWS_ACCESS_KEY_ID ? "yes" : "NO - missing");
const express = require("express");
const cors = require("cors");
const { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const app = express();
const PORT = process.env.PORT || 3000;
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })

// --- Middleware ---
app.use(cors());
app.use(express.json()); // required so req.body works in confirmUser.js

// --- Routes ---
app.post("/api/confirm-user", async (req, res) => {
    const { email } = req.body;
    try {
        await cognitoClient.send(
            new AdminConfirmSignUpCommand({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: email,
            })
        );
        res.json({ confirmed: true });
    } catch (err) {
        console.error(err); 
        res.status(400).json({ message: err.message });
    }
});

// -- Start Server --- 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
