const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const CLIENT_ID = "437828331085-17gj54k6qhnri2q64trfbmg7s2s4vjjg.apps.googleusercontent.com"; // Replace with your Google Client ID
const client = new OAuth2Client(CLIENT_ID);

const mongoose = require('mongoose');
const port = 8080;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json()); // Parse JSON body

// Render EJS Views
app.set("view engine", "ejs");

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signup", (req, res) => {
    res.render("Signup-1");
});

app.get("/login",(req,res) =>{
    res.render("login");
});

// API Endpoint to verify Google Token
app.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "Token is missing!" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload(); // User data
        res.json({
            success: true,
            user: {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            },
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
});


main()
.then(() => {
    console.log("Connection Succesful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}

const userSchema = new mongoose.Schema({
    UserName: String,
    Email: String,
    MobileNumber: Number,
    password:String
});

const SEUser = mongoose.model("SEUser",userSchema);



