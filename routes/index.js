var express = require("express");
var router = express.Router();
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("../utils/multer");
const { sendmail } = require("../utils/mail");
const fs = require("fs");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Home page", user: req.user });
});

// sign-up

router.get("/sign-up", function (req, res, next) {
  res.render("sign-up", {
    title: "sign up",
    user: req.user,
  });
});

router.post("/sign-up", async function (req, res, next) {
  try {
    const { username, email, password } = req.body;
    await userModel.register({ username, email }, password);
    res.redirect("/sign-in");
  } catch (error) {
    res.send(error);
  }
});

// sign-in

router.get("/sign-in", function (req, res, next) {
  res.render("sign-in", {
    title: "sign in",
    user: req.user,
  });
});

router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/sign-in",
  })
);

// sing-out

router.get("/sign-out", async function (req, res, next) {
  try {
    req.logOut(() => {
      res.redirect("/sign-in");
    });
  } catch (error) {
    res.send(error);
  }
});

// home

router.get("/home", isLoggedIn, async function (req, res, next) {
  try {
    const { books } = await req.user.populate("books");
    res.render("home", {
      title: "home",
      books,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

// profile

router.get("/profile", isLoggedIn, async function (req, res, next) {
  res.render("profile", {
    title: "profile",
    user: req.user,
  });
});

router.post(
  "/avatar",
  upload.single("avatar"),
  isLoggedIn,
  async function (req, res, next) {
    try {
      if (req.user.avatar !== "default.jpg") {
        fs.unlinkSync("./public/images" + req.user.avatar);
      }
      req.user.avatar = req.file.filename;
      req.user.save();
      res.redirect("/profile");
    } catch (error) {
      res.send(error);
    }
  }
);

// update

router.get("/update/:id", async function (req, res, next) {
  try {
    const Users = await userModel.findById(req.params.id);
    res.render("update", {
      title: "update",
      Users,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/update/:id", async function (req, res, next) {
  try {
    await userModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

// delete

router.get("/delete/:id", async function (req, res, next) {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect("/home");
  } catch (error) {
    res.send(error);
  }
});

// get-email

router.get("/get-email", async function (req, res, next) {
  try {
    res.render("get-email", {
      title: "forget password",
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/get-email", async function (req, res, next) {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user === null) {
      return res.send(
        `invalid email address <a href="/get-email">forget password</a>`
      );
    }
    sendmail(req, res, user);
  } catch (error) {
    res.send(error);
  }
});

// create

router.get("/create/:id", async function (req, res, next) {
  try {
    res.render("create", {
      title: "create passowrd",
      id: req.params.id,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/create/:id", async function (req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (user.passwordResetToken === 1) {
      await user.setPassword(req.body.password);
      user.passwordResetToken = 0;
    } else {
      res.send(`link is expired <a href='/get-email'>forget password</a>`);
    }
    await user.save();
    res.redirect("/sign-in");
  } catch (error) {
    res.send(error);
  }
});

// reset

router.get("/reset/:id", async function (req, res, next) {
  try {
    res.render("reset", {
      title: "reset passowrd",
      id: req.params.id,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/reset/:id", isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(req.body.oldpassword, req.body.password);
    await req.user.save();
    res.redirect("/home");
  } catch (error) {
    res.send(error);
  }
});

// ..................book list........

// create-task

router.get("/create-task", function (req, res, next) {
  res.render("create-task", {
    title: "create",
    user: req.user,
  });
});

router.post("/create-task", async function (req, res, next) {
  try {
    const book = new bookModel(req.body);
    book.user = req.user._id;
    req.user.books.push(book._id);
    await book.save();
    await req.user.save();
    res.redirect("/home");
  } catch (error) {
    res.send(error);
  }
});

// delete

router.get("/delete-task/:id", async function (req, res, next) {
  try {
    await bookModel.findByIdAndDelete(req.params.id);
    res.redirect("/home");
  } catch (error) {
    res.send(error);
  }
});

// update todo

router.get('/update-task/:id' , async function (req,res,next) {
  try {
    const book = await bookModel.findById(req.params.id)
    res.render('update-task',{
      title:'update book',
      book,
      user:req.user
    })
  } catch (error) {
    res.send(error)
  }

})

router.post('/update-task/:id', async function (req,res,next) {
  try {
    await bookModel.findByIdAndUpdate(req.params.id,req.body)
    res.redirect('/home')
  } catch (error) {
    res.send(error)
  }
})

// delete todo

router.get('/delete-task/:id', async function (req,res,next) {
  try {
    await bookModel.findByIdAndDelete(req.params.id)
    res.redirect('/home')
  } catch (error) {
    res.send(error)
  }
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/sign-in");
}

module.exports = router;
