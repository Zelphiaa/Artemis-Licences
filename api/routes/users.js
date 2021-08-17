const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//email
const nodemailer = require("nodemailer");

//import models
const User = require("../models/user");

//import middleware
const { checkAuth, checkAdm } = require("../middlewares/authentication");

//POST request - create user
router.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const rol = req.body.rol;
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const secretToken = makeid(25);

    const newUser = {
      email: email,
      name: name,
      password: encryptedPassword,
      rol: rol,
      secretToken: secretToken
    };
    const userDB = await User.create(newUser);

    //COMPOSE AN EMAIL
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "zelphia1t@gmail.com",
        pass: ""
      }
    })

    const data = {
      from: "'Kour' <Artemisdevelopment@gmail.com>",
      to: email,
      subject: "Please Verify Your email",
      html: `Hi there,
      <br/>
      Thank you fro registering
      <br/><br/>
      Please verify your email in the next link
      <br/>
      <a href="${process.env.HTML}/verify/${secretToken}">${process.env.HTML}/verify?secretToken=${secretToken}</a>
      <br/><br/>
      Have a pleasant day!`
    };

    await transporter.sendMail(data, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(data);
    });

    const toSend = {
      status: "success",
      email: email,
      name: name
    };
    return res.json(toSend);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

//POST request - verify email
router.post("/verify-email", async (req, res) => {
  try {
    const secretToken = req.body.secretToken;
    console.log(req.body);

    const findUser = await User.findOne({ secretToken: secretToken });
    console.log(findUser);
    if (findUser.active == false) {
      const verifyUser = await User.findOneAndUpdate(
        { _id: findUser._id },
        {$set:{ 'active': true, secretToken: ""} },
        { new: true, runValidators: true }
      );
      if (verifyUser.active == true) {
        return res.json({
          status: "success",
          message: "Email verify :)"
        });
      } else {
        return res.status(400).json({
          status: "Error",
          message: "Error to verify email"
        });
      }
    } else {
      return res.json({
        status: "error",
        message: "You has verify your email!"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: error.error
    })
  }
});

//POST request - login user
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userDB = await User.findOne({ email: email });

    if (!userDB) {
      return res.status(400).json({
        status: "error",
        message: "User or password invalid"
      });
    }
    if (userDB.active == false) {
      return res.status(400).json({
        status: "error",
        message: "Please verify your email"
      });
    }
    //WRONG PASSWORD
    if (!bcrypt.compareSync(password, userDB.password)) {
      return res.status(400).json({
        message: "User or password invalid"
      });
    }

    const token = jwt.sign({ userData: userDB }, "SECRETPASSWORDSECRET", {
      expiresIn: 60 * 60 * 24 * 7
    });
    const toSend = {
      status: "success",
      token: token,
      userData: userDB
    };
    return res.json(toSend);
  } catch (error) {
    return res.status(400).json({
      status: "Error",
      error: error
    });
  }
});

//GET request - get users
router.get("/users", [checkAuth, checkAdm], async (req, res) => {
  try {
    const users = await User.find().populate("keys");

    return res.json({
      status: "success",
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

//GET request - get a single user
router.get("/user", [checkAuth], async (req, res) => {
  try {
    const _id = req.query._id;

    const userDB = await User.findOne({ _id: _id })
      .populate("keys")
      .exec();

    res.json({
      status: "success",
      data: userDB
    });
    return;
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

//PUT request - change rol
router.put("/user-rol", [checkAuth, checkAdm], async (req, res) => {
  try {
    const _id = req.query.userId;
    const rol = req.body.rol;
    const userDB = await User.findOneAndUpdate({ _id: _id }, { rol: rol });
    if (userDB) {
      return res.json({
        status: "success",
        message: "Rol changed successfully"
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

//PUT request - change password
router.put("/new-pass", checkAuth, async (req, res) => {
  try {
    console.log(req.body);
    const actPassword = req.body.actPassword;
    const newPassword = req.body.newPassword;
    const verifUser = await User.findOne({ _id: req.userData._id });
    if (verifUser) {
      if (bcrypt.compareSync(actPassword, verifUser.password)) {
        const updateUser = await User.findOneAndUpdate(
          { _id: req.userData._id },
          { password: bcrypt.hashSync(newPassword, 10) },
          { new: true, runValidators: true }
        );
        if (updateUser) {
          return res.json("Password changed");
          return;
        }
      }
      return res.status(400).json({
        status: "error",
        message: "The password does not exist"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

router.post("/recover-account", async (req, res)=> {
  try {
    console.log(req.body);
    const email = req.body.email

    const findUser = await User.findOne({email: email})
    if (findUser) {
      const tokenPassword = makeid(25);
      const updateUser = await User.findOneAndUpdate({_id: findUser._id}, {$set: {tokenPassword: tokenPassword}}, { runValidators: true,new: true})
      if (updateUser) {
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.GOOGLE_EMAIL,
            pass: process.env.GOOGLE_APP_PASS
          }

        })

        const data = {
          from: `'Artemis' <${process.env.GOOGLE_EMAIL}>`,
          to: email,
          subject: "Recovered account",
          html: `Hi there,
          <br/>
          If you want recover your account, click in the next link
          <br/><br/>
          <a href="${process.env.HTML}/recoveraccount/${tokenPassword}">${process.env.HTML}/recoveraccount/${tokenPassword}</a>
          <br/><br/>
          Have a pleasant day!`
        };
        await transporter.sendMail(data, (err, data) => {
          if (err) {
            console.log(err);
          }
          console.log(data);
        });

        const toSend = {
          status: "success",
          message: "Email sended"
        };
        return res.json(toSend)
      }
    }
    return res.status(500).json({
      status: "error",
      message: "Mail not found"
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error
    })
  }
})

router.put('/password-recover', async (req, res) => {
  try {
    console.log(req.body);
    const tokenPassword = req.query.tokenPassword
    const password = req.body.password
    const findUser = await User.findOne({tokenPassword: tokenPassword})

    if (findUser) {
      const updatePassword = await User.findOneAndUpdate({_id: findUser._id}, {password: bcrypt.hashSync(password,10)}, {runValidators: true, new: true})
      if (updatePassword) {
        const deleteToken = await User.findOneAndUpdate({_id: findUser._id}, {$set: {tokenPassword: ""}}, {runValidators: true, new: true})
        return res.json({
          status: "success",
          message: "Password updated"
        })
      }
    }
    return res.status(500).json({
      status: 'error',
      message: "User not found"
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: error.error
    })
  }
})



//check if exist user admin
global.check_user_admin = async function checkAdminUser() {
  try {
    const userAdmin = await User.find({ rol: "ADMIN" });
    if (userAdmin.length > 0) {
      console.log("Dont need");
      return;
    } else if (userAdmin.length == 0) {
      const encryptedPassword = bcrypt.hashSync("zelphia", 10);
      const toSend = {
        name: "ADMIN",
        email: "zelphia@gmail.com",
        rol: "ADMIN",
        active: true,
        password: encryptedPassword
      };
      await User.create(toSend);
      console.log("ADMIN USER CREATED");
      return;
    }
  } catch (error) {
    console.log("ERROR TO CREATE SUPERUSER");
    console.log(error);
    return;
  }
};

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
