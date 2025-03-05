const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const session = require('express-session');
const cookieParser = require('cookie-parser');


const port = 5155;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

//---------------------- VALIDATING FORMS -----------------------------
function validatePetForm(formData) {
    const requiredFields = ['animal', 'breed', 'age', 'gender', 'gettingAlong'];
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
            return false;
        }
    }
    return true;
}
function validateEmail(email){
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return true;
    }
    else{
        return false;
    }
}

let id = 1;

app.use(
	express.json(),
	express.urlencoded({
		extended: true,
  }));
app.use(express.static("public"));


app.get('/', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("home.ejs", {alreadyLoggedIn});
});

app.get('/findPet', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let message = "";
    let formData = {};
    let isFilled=true;
    res.render("findPet.ejs", {message, formData, isFilled, alreadyLoggedIn});
});

app.get('/dogCare', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("dogCare.ejs", {alreadyLoggedIn});
});

app.get('/catCare', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("catCare.ejs", {alreadyLoggedIn});
});

app.get('/givePet', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let message = '';
    if(alreadyLoggedIn){
        let formData = {};
        let isFilled = true;
        res.render("givePet.ejs", {message, formData, isFilled, alreadyLoggedIn});
    }
    else{
        message = "You have to log in first.";
        let redBox = true;
        res.render("login.ejs", {message, redBox, alreadyLoggedIn});
    }
});

app.get('/contact', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("contact.ejs", {alreadyLoggedIn});
});

app.get('/sources', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("sources.ejs", {alreadyLoggedIn});
});

app.get('/disclaimer', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    res.render("disclaimer.ejs", {alreadyLoggedIn});
});

app.get('/login', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let message = '';
    let redBox = false;
    if(alreadyLoggedIn){
        const username = req.cookies.username;
        res.render("successLogin.ejs", {message, redBox, username, alreadyLoggedIn});
    }
    else{
        res.render("login.ejs", {message, redBox, alreadyLoggedIn});
    }
});

app.get('/signUp', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let message = '';
    let redBox = false;
    if(alreadyLoggedIn){
        const username = req.cookies.username;
        res.render("successLogin.ejs", {message, redBox, username, alreadyLoggedIn});
    }
    else{
        res.render("signUp.ejs", {message, redBox, alreadyLoggedIn});
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('loggedIn');
    res.clearCookie('username');
    req.session.destroy((err)=> {
        if(err){
            console.log("Error destroying");
        }
        else{
            res.redirect('/');
        }
    });
})

app.post('/findPet', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let formData = req.body;
    let message;
    let isFilled = true;
    let rightPets = [];
    let numCats = 0;
    let numDogs = 0;
    let numPets = 0;

    if (validatePetForm(formData)) {
        fs.readFile("./availablePets.txt", 'utf-8', function(err, data) {
            if (err) {
                throw err;
            }
            let petInfo = data.split("\n");
            for (var i = 0; i < petInfo.length; i++) {
                if (petInfo[i].trim() !== '') {
                    let petData = petInfo[i].split(":");
                    if (
                        formData["animal"] === petData[2] &&
                        formData["breed"] === petData[3] || formData["breed"] === "doesnt_matter"&&
                        formData["age"] === petData[4] || formData["age"] === "doesnt_matter"&&
                        formData["gender"] === petData[5] || formData["gender"] === "doesnt_matter"&&
                        formData["gettingAlong"] === petData[6]
                    ) {
                        rightPets.push(petData);
                    }
                    numPets++;
                }
            }
            for (var k = 0; k < rightPets.length; k++) {
                if (rightPets[k][2] === "cat") {
                    numCats++;
                } else if (rightPets[k][2] === "dog") {
                    numDogs++;
                }
            }
            res.render("pets2.ejs", {alreadyLoggedIn, rightPets, numCats, numDogs, numPets });
        })
    } else {
        isFilled = false;
        message = "Please fill out all fields.";
        res.render("findPet.ejs", {message, formData, isFilled, alreadyLoggedIn });
    }
})


app.post('/givePet', (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let formData = req.body;
    let petData = req.body;
    let message;
    let isFilled=true;

    if(req.body["email"].trim() === ''){
        isFilled=false;
        message = "Please fill out all fields." 
        res.render("givePet.ejs", {message, formData, isFilled,alreadyLoggedIn });
    }
    else if(validateEmail(req.body["email"])){
        if(validatePetForm(formData)){
            let animal = petData["animal"];
            let breed = petData["breed"];
            let age = petData["age"];
            let gender = petData["gender"];
            let getsAlong = petData["gettingAlong"];
            let extraInfo = petData["extraInfo"];
            let ownerName = petData["name"];
            let email = petData["email"];
            message='';
            formData = {};
            const username = req.cookies.username;
            fs.appendFile("availablePets.txt", `${id}:${username}:${animal}:${breed}:${age}:${gender}:${getsAlong}:${extraInfo}:${ownerName}:${email}\n`, (err) => {
                if (err){throw err};
                id += 1;
            })
            res.render("givePet.ejs", {message, formData, isFilled, alreadyLoggedIn});
        }
        else{
            isFilled=false;
            message = "Please fill out all fields." 
            res.render("givePet.ejs", {message, formData, isFilled, alreadyLoggedIn});
        }
    }
    else{
        if(validatePetForm(formData)){
            isFilled=false;
            message='Please enter a valid email address.';
            res.render("givePet.ejs", {message, formData, isFilled, alreadyLoggedIn});
        }
        else{
            isFilled=false;
            message = "Please fill out all fields and enter a valid email address." 
            res.render("givePet.ejs", {message, formData, isFilled, alreadyLoggedIn});
        }
    }
})


app.post("/signUp", (req, res) => {
    const alreadyLoggedIn = req.cookies.loggedIn === 'true';
    let formData = req.body;
    let username = formData["username"];
    let password = formData["password"];
    let alreadyTaken = false;
    let message = '';
    let redBox = false;
    fs.readFile("./login.txt", 'utf-8', function(err, data) {
        if(err){throw err};
        if(data.includes(username)){
            alreadyTaken = true;
        }
        if(alreadyTaken){
            message = "This username is not available. Please try again."
            redBox = true;
            res.render("signUp.ejs", {message, redBox, alreadyLoggedIn});
        }
        else{
            fs.appendFile("login.txt", `${username}:${password}\n`, (err) => {
                if (err){throw err};
            })
            res.render("successSignUp.ejs", {message, redBox, alreadyLoggedIn, username});
        }
    })
})

app.post("/login", (req, res) => {
    let formData = req.body;
    let username = formData["username"];
    let password = formData["password"];
    let accountExists = false;
    let message = '';
    let rightPassword = '';
    let redBox = false;
    fs.readFile("./login.txt", 'utf-8', function(err, data) {
        if(err){throw err};
        let userInfo = data.split("\n");
        for(var i = 0; i<userInfo.length; i++){
            userInfo[i] = userInfo[i].split(":");
        }
        for(var j = 0; j<userInfo.length; j++){
            if(userInfo[j][0] == username){
                accountExists = true;
                rightPassword = userInfo[j][1]
                break;
            }
        }
        if(accountExists){
            if(password == rightPassword){
                req.session.username = username;
                res.cookie("loggedIn", true);
                res.cookie("username", username);
                res.render("successLogin.ejs", {message, redBox, username, alreadyLoggedIn: true});
            }
            else{
                message = "Wrong password. Try again!"
                redBox = true;
                const alreadyLoggedIn = req.cookies.loggedIn === 'true';
                res.render("login.ejs", {message, redBox, alreadyLoggedIn});
            }
        }
        else{
            message = "This account username does not exist. Please create an account."
            redBox = true;
            const alreadyLoggedIn = req.cookies.loggedIn === 'true';
            res.render("login.ejs", {message, redBox, alreadyLoggedIn});
        }
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
