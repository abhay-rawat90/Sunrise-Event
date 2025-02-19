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

main()
  .then(() => {
    console.log("Connection Succesful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");

  // use await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test'); if your database has auth enabled
}
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
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

app.get("/admin",(req,res) => {
    res.render("admin");
});

app.get("/gallery", (req,res) => {
  res.render("gallerywed")
});


app.get("/enter-email", (req,res) => {
  res.render("enter-email")
});
app.get("/reset-password", (req,res) => {
  res.render("reset-password")
});
app.get("/contact", (req,res) => {
  res.render("contact")
});
app.get("/booking",(req,res) => {
  res.render("booking");
})

app.get("/admin-gallery",(req,res) => {
  res.render("admin-gallery");
})
app.get("/rental",(req,res) => {
  res.render("rental");
})
app.get("/wedding",(req,res) => {
  res.render("wedding");
})
app.get("/birthday",(req,res) => {
  res.render("birthday");
})
app.get("/others",(req,res) => {
  res.render("otherevents");
})
app.get("/about", (req,res) => {
  res.render("aboutus")
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
  if(password == "admin#123" && username == "admin")
  {
    res.render("admin",{ name });
  }
  if (name[0].name === username && await bcrypt.compare(password, name[0].password)) {
    res.render("home after login",{ name });
  }
  // else{
  //   console.log("false");
  // }
  
});
// API Endpoint to verify Google Token
//For google login
app.post("/verify-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is missing!" });
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