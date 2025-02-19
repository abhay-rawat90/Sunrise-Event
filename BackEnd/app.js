require('dotenv').config();
const express = require("express");

const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const seuser = require("./Models/user");
const booking = require("./Models/book");
const service = require("./Models/services");
const CLIENT_ID =
  "437828331085-17gj54k6qhnri2q64trfbmg7s2s4vjjg.apps.googleusercontent.com"; // Replace with your Google Client ID
const client = new OAuth2Client(CLIENT_ID);
const mongoose = require("mongoose");
const Razorpay = require('razorpay');
const nodemailer = require("nodemailer");

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

app.get("/gallery", (req,res) => {
  res.render("gallerywed")
});

app.get("/admin-booking", async (req, res) => {
  try {
    const bookings = await booking.find({});
    res.render("adminbookings", { bookings });
  } catch (error) {
    console.error("Error fetching booking data:", error);
    res.status(500).send("Error fetching booking data.");
  }
});

app.get("/enter-email", (req,res) => {
  res.render("enter-email")
});
app.get("/reset-password", (req,res) => {
  res.render("reset-password")
});
app.get("/booking",(req,res) => {
  res.render("booking");
})

app.get("/admin-gallery",(req,res) => {
  res.render("admin-gallery");
})

app.get("/home-login",(req,res) => {
  res.render("home after login");
})

app.get("/google-login",(req,res) => {
  res.render("google-login");
})

app.get("/birthday",(req,res) =>{
  res.render("birthday");
});

app.get("/enter-email",(req,res) => {
  res.render("enter-email");
});

app.get("/contact", (req,res) => {
  res.render("contact")
});
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
app.post("/profile/:id",(req,res) => {
  const { id } = req.params;
  console.log(id);
  const userarr = seuser.find({name : name});
  console.log(userarr);
  const user = userarr[0];
  
  res.render("Profile Section",{ user });
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
    res.redirect("/login");
  }
});
//post req from login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const name = await seuser.find({ name: username });
  const services = await service.find({});
  if (name[0].name === username && await bcrypt.compare(password, name[0].password)) {
    res.render("home after login",{ name, services });
  }
  // else{
  //   console.log("false");
  // }
  
});

app.post("/booking", async (req, res) => {
  const { event, name, mobilenumber, email, venue, guests, date, anycustom, payment_done,pay_id } = req.body;

  if (payment_done !== 'yes') {
    return res.status(400).send("Payment not confirmed.");
  }

  try {
    let book1 = new booking({
      event: event,
      name: name,
      mobilenumber: mobilenumber,
      email: email,
      venue: venue,
      guests: guests,
      date: date,
      anycustom: anycustom,
      pay_id:pay_id,
    });
    await book1.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error saving booking details:", error);
    res.status(500).send("Error saving booking details.");
  }
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

    let user = await seuser.findOne({ email: payload.email });
    if (!user) {
      // Save new user data to the database
      user = new seuser({
        name: payload.name,
        email: payload.email,
      });
      await user.save();
    }
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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/payment/create-order', async (req, res) => {
  const { amount, currency } = req.body;
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: currency,
    receipt: `receipt_order_${Math.random()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/payment/receipt', async (req, res) => {
  const { order_id, payment_id, amount, currency } = req.body;
  // Generate a receipt (you can customize this as needed)
  const receipt = {
    order_id,
    payment_id,
    amount,
    currency,
    date: new Date().toISOString()
  };
  // Send the receipt to the customer (e.g., via email) or store it in the database
  // For simplicity, we'll just send it back in the response
  res.json({ success: true, receipt });
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD // Your email password
  }
});

app.post("/send-reset-email", async (req, res) => {
  const { email } = req.body;

  // Create a reset link (you can customize this as needed)
  const resetLink = `http://localhost:8080/reset-password?email=${email}`;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetLink}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});



app.get("/home-admin", async (req,res) => {
  const name = await seuser.find({ name: "admin" });
  let services = await service.find();
  res.render("home after login",{ name, services});
});

//DELETE route method override not working
app.post("/card/:id", async (req, res) => {
  const { id } = req.params;
  const name = await seuser.find({ name: "admin" });
  console.log(id);
  await service.findByIdAndDelete(id);
  res.redirect("/home-admin");
});


//post request for adding a service card
app.post("/addservice", async (req, res) => {
  const { title, description } = req.body;
  
  console.log(title, description);
  let s1 = new service({
    title: title,
    description: description,
  }).save();
  let services = await service.find();
  res.redirect("/home-admin");
});
