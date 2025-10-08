if (process.env.NODE_ENV != "production") {
  require('dotenv').config()
}

const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const NodeCache = require('node-cache');

const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/Listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wishlistRouter = require("./routes/wishlist.js");
const notificationRouter = require("./routes/notifications.js");
const wrapAsync = require("./utils/wrapAsync.js");

// Initialize cache
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL



const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategi = require("passport-local");
const User = require("./models/user.js");


// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/login', authLimiter);
app.use('/signup', authLimiter);

app.use(cookieParser());
const DBURL = process.env.ATLASDB_URL;

// Make io available to routes
app.set('io', io);
app.set('cache', cache);


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(DBURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));


const store =  MongoStore.create({
  mongoUrl : DBURL,
  crypto: {
    secret: process.env.SECRET,
  },
   touchAfter: 24 * 3600 

});


const sessionOption = {
  secret:  process.env.SECRET,
  store,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: + 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategi(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.cache = cache;
  next();
})



// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/wishlist", wishlistRouter);
app.use("/notifications", notificationRouter);

// API routes with caching
app.get('/api/listings/popular', wrapAsync(async (req, res) => {
  const cacheKey = 'popular-listings';
  let popularListings = cache.get(cacheKey);
  
  if (!popularListings) {
    const Listing = require('./models/listing');
    popularListings = await Listing.find()
      .sort({ views: -1 })
      .limit(10)
      .populate('owner', 'username');
    cache.set(cacheKey, popularListings, 300); // Cache for 5 minutes
  }
  
  res.json({ success: true, listings: popularListings });
}));

// Analytics API
app.get('/api/analytics/dashboard', wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const cacheKey = `analytics-${req.user._id}`;
  let analytics = cache.get(cacheKey);
  
  if (!analytics) {
    const Listing = require('./models/listing');
    const Booking = require('./models/Booking');
    const Review = require('./models/Review');
    
    const [totalListings, totalBookings, totalReviews, avgRating] = await Promise.all([
      Listing.countDocuments({ owner: req.user._id }),
      Booking.countDocuments({ host: req.user._id }),
      Review.countDocuments({ listing: { $in: await Listing.find({ owner: req.user._id }).select('_id') } }),
      Review.aggregate([
        { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'listing' } },
        { $match: { 'listing.owner': req.user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);
    
    analytics = {
      totalListings,
      totalBookings,
      totalReviews,
      avgRating: avgRating[0]?.avgRating || 0
    };
    
    cache.set(cacheKey, analytics, 600); // Cache for 10 minutes
  }
  
  res.json({ success: true, data: analytics });
}));


app.use((req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

//  Final Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  // Handle real-time chat
  socket.on('send-message', async (data) => {
    try {
      const Chat = require('./models/Chat');
      const newMessage = new Chat({
        sender: data.senderId,
        receiver: data.receiverId,
        message: data.message,
        listingId: data.listingId
      });
      await newMessage.save();
      
      // Send to receiver
      io.to(`user-${data.receiverId}`).emit('receive-message', {
        ...data,
        timestamp: new Date(),
        _id: newMessage._id
      });
    } catch (error) {
      console.error('Chat error:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`user-${data.receiverId}`).emit('user-typing', {
      senderId: data.senderId,
      isTyping: data.isTyping
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});

