const express = require("express");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const seuser = require("./Models/user");
const CLIENT_ID =
  "437828331085-17gj54k6qhnri2q64trfbmg7s2s4vjjg.apps.googleusercontent.com"; // Replace with your Google Client ID
const client = new OAuth2Client(CLIENT_ID);
const mongoose = require("mongoose");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true }));
// Render EJS Views
app.set("view engine", "ejs");

app.listen(8080, () => {
  console.log(`Server running on http://localhost:8080`);
});

// Middleware

app.get("/", (req, res) => {
    res.render("home");
});
//Get req to signup
app.get("/signup", (req, res) => {
  res.render("Signup-1");
});
//Get rq to login
app.get("/login", (req, res) => {
  res.render("login");
});
//Post req from signup
app.post("/signup", async (req, res) => {
  const { name, mobilenumber, email, password, confirm } = req.body;
  const hash = await bcrypt.hash(password, 13);
  if (password === confirm) {
    let user1 = new seuser({
      name: name,
      email: email,
      mobilenumber: mobilenumber,
      password: hash,
    }).save();
    res.redirect("/");
  }
});
//post req from login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const name = await seuser.find({ name: username });
  if (name[0].name === username && bcrypt.compare(name[0].password, password)) {
    res.redirect("/");
  }
});
// API Endpoint to verify Google Token
//For google login
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


