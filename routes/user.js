const express = require("express");
const Router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controller/users.js");

Router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signupUser));

Router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.loginUser
    );

Router.get("/logout", userController.logoutUser);

// Account page route
Router.get("/account", isLoggedIn, wrapAsync(userController.renderAccountPage));

// Settings page route
Router.get("/settings", isLoggedIn, (req, res) => {
    res.render("users/settings");
});

// Change password route
Router.post("/change-password", isLoggedIn, wrapAsync(userController.changePassword));

// Update profile route
Router.post("/update-profile", isLoggedIn, upload.single('profilePhoto'), wrapAsync(userController.updateProfile));

// Update single field route
Router.post("/update-field", isLoggedIn, wrapAsync(userController.updateField));

// Delete account route
Router.delete("/delete-account", isLoggedIn, wrapAsync(userController.deleteAccount));

module.exports = Router;
