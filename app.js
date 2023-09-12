import express from "express";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import cors from "cors";
import sendEmail from "./server/mailer.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
let db;

const connectToDb = async () => {
  try {
    const dbUser = await MongoClient.connect(
      "mongodb+srv://dbUser:dbUserPassword@cluster0.etrlw3p.mongodb.net/userDB?retryWrites=true&w=majority"
    );
    const clientDb = await dbUser.db("userDB");
    db = clientDb;
    startServer();
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

connectToDb();

// Middleware to check if DB connection is alive
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: "Database connection error" });
  }
  next();
});

// Route to fetch data from the "user" collection
app.get("/users", async (req, res) => {
  try {
    const data = await db.collection("user").find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server after connecting to DB
const PORT = 3000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

app.post("/signup", async (req, res) => {
  const data = req.body;

  const dataSignUp = {
    name: data.name,
    lastname: data.lastName,
    email: data.email,
    password: data.password,
    phone_number: null,
    orders: [],
    security: {
      "2fa": false,
    },
    registration_date: new Date().toISOString().slice(0, 10),
    shipping_address: [],
    billing_payment_method: [],
  };

  try {
    const dbData = await signUp(dataSignUp);
    res.status(200).json(dbData);
  } catch (error) {
    res.status(200).json({ error }); // It's better to use error.message to get the error description
  }
});

app.post("/post", async (req, res) => {
  const data = req.body;

  try {
    const dbData = await doLogin(data);
    res.status(200).json(dbData);
  } catch (error) {
    res.status(200).json(error);
  }
});

const doLogin = (data) => {
  return new Promise(async (resolve, reject) => {
    const dbData = await db.collection("user").findOne({ email: data.email });

    // Check if user is found
    if (dbData) {
      // Check if passwords match
      if (dbData.password === data.password) {
        resolve({ msg: "Success", id: dbData._id, success: true });
      } else {
        reject({
          msg: "Oops! Something's not matching up. Please double-check your details and try again.",
          success: false,
        });
      }
    } else {
      reject({
        msg: "Oops! We couldn't find an account with that information. Please double-check and try again.",
        success: false,
      });
    }
  });
};

const signUp = (data) => {
  return new Promise(async (resolve, reject) => {
    const dbData = await db.collection("user").findOne({ email: data.email });
    if (dbData) {
      reject({
        msg: "Oops! That email is already registered. Try logging in or using a different email.",
        code: 200,
        success: false,
      });
    } else {
      const insertDb = await db.collection("user").insertOne(data);
      if (insertDb.acknowledged) {
        resolve({
          msg: "Registration successful! Welcome aboard.",
          code: 200,
          success: true,
          id: insertDb.insertedId,
        });

        setTimeout(() => {
          sendEmailStmp(data.email, data.name);
        }, 1000);
      }
    }
  });
};

const sendEmailStmp = async (email, name) => {
  try {
    await sendEmail(email, name);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

app.get("/userInfo", async (req, res) => {
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const [bearer, id] = authorizationHeader.split(" ");

  if (bearer !== "Bearer" || !id) {
    return res.status(401).json({
      error: "Invalid Authorization format. Expected format: Bearer <ID>",
    });
  }

  try {
    const request = await getUser(id);
    res.status(200).json(request);
  } catch (error) {
    res.status(401).json({
      error: "Invalid Authorization id.",
    });
  }
});

const getUser = async (us) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Use findOne() instead of find()
      const dbData = await db
        .collection("user")
        .findOne({ _id: new ObjectId(us) });

      if (dbData) {
        resolve({
          success: true,
          name: dbData.name,
          lastName: dbData.lastname,
          phone: dbData?.phone_number,
          email: dbData.email,
          code: 200,
        });
      } else {
        reject({
          msg: "No user found with this id",
          code: 401,
          success: false,
        });
      }
    } catch (err) {
      reject({
        msg: "Database error: " + err.message,
        code: 500,
        success: false,
      });
    }
  });
};

const getGiftCards = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbData = await db.collection("Gitcards").find().toArray();
      if (dbData && dbData.length > 0) {
        resolve(dbData);
      } else {
        reject("No gift cards found!");
      }
    } catch (error) {
      reject("Something went wrong!");
    }
  });
};

app.get("/giftcard", async (req, res) => {
  try {
    const gifts = await getGiftCards();

    res.status(200).json({ gift_cards: gifts, success: true });
  } catch (error) {
    res.status(401).json({ msg: error, success: false });
  }
});

app.post("/updateUser", async (req, res) => {
  const authorizationHeader = req.header("Authorization");
  const data = req.body;

  if (!authorizationHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const [bearer, id] = authorizationHeader.split(" ");

  if (bearer !== "Bearer" || !id) {
    return res.status(401).json({
      error: "Invalid Authorization format. Expected format: Bearer <ID>",
    });
  }

  try {
    const resDB = await updateUserData(id, data);
    res.status(200).json(resDB);
  } catch (error) {
    res.status(error.code).json({
      error: error.msg,
    });
  }
});

const updateUserData = (id, data) => {
  const updateData = {
    name: data.name,
    password: data.password,
    phone_number: data.phone_number,
    email: data.email,
    lastname: data.lastname,
  };

  return new Promise(async (resolve, reject) => {
    try {
      // Check for existing email but exclude the current user by ID
      const dbUserFindEmail = await db
        .collection("user")
        .findOne({ email: updateData.email, _id: { $ne: new ObjectId(id) } });

      if (dbUserFindEmail) {
        reject({
          msg: "Oops! That email is already registered. Try logging in or using a different email.",
          code: 200,
          success: false,
        });
      } else {
        const dbData = await db
          .collection("user")
          .findOne({ _id: new ObjectId(id) });

        if (!dbData) {
          reject({
            msg: "No user found with this id",
            code: 404,
            success: false,
          });
          return;
        }

        // Validate and sanitize 'data' here as per your requirements

        // Update the user data.
        const reso = await db
          .collection("user")
          .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

        if (reso.modifiedCount === 1) {
          resolve({ msg: "User data updated successfully.", success: true });
        } else {
          reject({ msg: "User data not updated.", success: false });
        }
      }
    } catch (error) {
      reject({
        msg: "Database error: " + error.message,
        code: 500,
        success: false,
      });
    }
  });
};
