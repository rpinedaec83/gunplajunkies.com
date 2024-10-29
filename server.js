const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        name: "auth-session",
        keys: [process.env.COOKIE_SECRET], // should use as secret environment variable
        httpOnly: true,
    })
);

const db = require("./app/models");

const Role = db.role;


db.mongoose
    .connect(process.env.mongoURI)
    .then(async () => {
        console.log("Successfully connect to MongoDB.");
        await initial();
    })
    .catch((err) => {
        console.error("Connection error", err);
        process.exit();
    });



app.get("/", (req, res) => {
    res.send("Hola");
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});


async function initial() {
    await Role.estimatedDocumentCount().then((data) => {
        if (data === 0) {
            new Role({
                name: "user",
            }).save().then((data) => {
                console.log("added 'user' to roles collection");
            })
            new Role({
                name: "moderator",
            }).save().then((data) => {
                console.log("added 'moderator' to roles collection");
            })
            new Role({
                name: "admin",
            }).save().then((data) => {
                console.log("added 'admin' to roles collection");
            })
        }
    }).catch((error)=>{
        console.log("Hubo un error: "+ error.message)
    })
}