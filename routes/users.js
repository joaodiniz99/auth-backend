var express = require('express');
var router = express.Router();
const User = require("../db/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../auth");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/free-endpoint', (req, res) => {
  res.json({
    message: "You are free to access me anytime"
  })
})

router.get('/auth-endpoint', auth, (req, res) => {
  res.json({
    message: "You are authorized to access me"
  })
})

router.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: req.body.email,
        password: hashedPassword
      });

      // save the new user
      user.save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          res.status(201).send({
            message: "User Created Successfully",
            result
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((e) => {
          res.status(500).send({
            message: "Error creating user",
            e
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt.compare(req.body.password, user.password)
        .then((passwordCheck) => {
          // check if password matches
          if(!passwordCheck) {
            return res.status(400).send({
              message: "Passwords does not match"
            })
          }

          // create JWT Token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          // return success response
          res.status(200).send({
            message: "Login Successfull",
            email: user.email,
            token
          });
        })
        .catch((e) => {
          res.status(400).send({
            message: "Error checking password",
            e
          })
        });
    })
    .catch((e) => {
      res.status(404).send({
        message: "Email not found",
        e
      })
    });
});

module.exports = router;
