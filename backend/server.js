require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const app = express();
const PORT = process.env.PORT || 3000;

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// -- Authorization --- 
const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function verifyCognitoToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or malformed authorization header" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = await jwtVerifier.verify(token);
        req.user = { sub: payload.sub, email: payload.email, name: payload.name };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

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

app.get("/api/challenges", async (req, res) => {
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Challenges" }));
        res.json(result.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/progress", verifyCognitoToken, async (req, res) => {
    try {
        const result = await docClient.send(
            new QueryCommand({
                TableName: "UserProgress",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: { ":userId": req.user.sub },
            })
        );
        res.json(result.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/challenges/:id/submit", verifyCognitoToken, async (req, res) => {
  const challengeId = req.params.id;
  const { answer } = req.body;

  try {
    const challengeResult = await docClient.send(
      new GetCommand({
        TableName: "Challenges",
        Key: { id: challengeId },
      })
    );
    const challenge = challengeResult.Item;

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    await docClient.send(
      new PutCommand({
        TableName: "UserProgress",
        Item: {
          userId: req.user.sub,
          challengeId,
          status: "completed",
          answer,
          completedAt: new Date().toISOString(),
        },
      })
    );

    res.json({ success: true, pointsEarned: challenge.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// -- Start Server --- 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
