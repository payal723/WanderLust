const Review = require("../models/Review.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

//signup 

module.exports.signupUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");

};

//login

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);

};

//logout

module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You Are logOut successfully!!");
        let redirectUrl = res.locals.redirectUrl || "/listings"
        res.redirect(redirectUrl);
    })
};

// Account page
module.exports.renderAccountPage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/listings");
        }
        
        const userListings = await Listing.find({ owner: req.user._id }) || [];
        const userReviews = await Review.find({ author: req.user._id }).populate('listing') || [];
        
        res.render("users/account", { 
            user, 
            userListings, 
            userReviews 
        });
    } catch (error) {
        console.error('Account page error:', error);
        req.flash("error", "Error loading account page");
        res.redirect("/listings");
    }
};

// Change password
module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            req.flash("error", "New passwords do not match");
            return res.redirect("/settings");
        }
        
        if (newPassword.length < 6) {
            req.flash("error", "Password must be at least 6 characters long");
            return res.redirect("/settings");
        }
        
        const user = await User.findById(req.user._id);
        
        await user.changePassword(currentPassword, newPassword);
        
        req.flash("success", "Password changed successfully!");
        res.redirect("/settings");
        
    } catch (error) {
        console.error('Password change error:', error);
        req.flash("error", "Current password is incorrect");
        res.redirect("/settings");
    }
};

// Update profile
module.exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user._id;
        
        const updateData = { username, email };
        
        // Handle profile photo upload
        if (req.file) {
            updateData.profilePhoto = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        
        await User.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "Profile updated successfully" });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.json({ success: false, message: "Error updating profile" });
    }
};

// Update single field
module.exports.updateField = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;
        
        await User.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "Field updated successfully" });
        
    } catch (error) {
        console.error('Field update error:', error);
        res.json({ success: false, message: "Error updating field" });
    }
};

// Delete account
module.exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Listing.deleteMany({ owner: userId });
        await Review.deleteMany({ author: userId });
        await User.findByIdAndDelete(userId);
        
        req.logout((err) => {
            if (err) {
                return res.json({ success: false, message: "Error logging out" });
            }
            res.json({ success: true, message: "Account deleted successfully" });
        });
        
    } catch (error) {
        console.error('Account deletion error:', error);
        res.json({ success: false, message: "Error deleting account" });
    }
};