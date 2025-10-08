# WanderLust 🏠

A full-stack web application for listing and booking accommodations, built with Node.js, Express, MongoDB, and EJS.

## Features ✨

- **User Authentication** - Sign up, login, logout with session management
- **Property Listings** - Create, view, edit, and delete property listings
- **Image Upload** - Upload property images with Cloudinary integration
- **Reviews & Ratings** - Leave reviews and rate properties
- **Interactive Maps** - View property locations with Leaflet maps
- **Search & Filter** - Advanced search functionality
- **Responsive Design** - Mobile-friendly interface
- **Wishlist** - Save favorite properties
- **Notifications** - Real-time notifications system

## Tech Stack 🛠️

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** EJS, Bootstrap, CSS3
- **Authentication:** Passport.js
- **File Upload:** Multer, Cloudinary
- **Maps:** Leaflet.js
- **Validation:** Joi
- **Session:** Express-session

## Installation 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wanderlust.git
   cd wanderlust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URL=your_mongodb_connection_string
   SECRET=your_session_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Initialize the database**
   ```bash
   node init/index.js
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Visit** `http://localhost:8080`

## Project Structure 📁

```
MajorProject/
├── controller/          # Route controllers
├── models/             # MongoDB models
├── routes/             # Express routes
├── views/              # EJS templates
├── public/             # Static files (CSS, JS, images)
├── middleware.js       # Custom middleware
├── schema.js          # Joi validation schemas
├── app.js             # Main application file
└── package.json       # Dependencies
```

## API Routes 🛣️

### Authentication
- `GET /signup` - Sign up page
- `POST /signup` - Create new user
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `POST /logout` - Logout user

### Listings
- `GET /listings` - View all listings
- `GET /listings/new` - New listing form
- `POST /listings` - Create new listing
- `GET /listings/:id` - View single listing
- `GET /listings/:id/edit` - Edit listing form
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing

### Reviews
- `POST /listings/:id/reviews` - Add review
- `DELETE /listings/:id/reviews/:reviewId` - Delete review

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Setup 🔧

### Required Environment Variables:
- `MONGODB_URL` - MongoDB connection string
- `SECRET` - Session secret key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Optional:
- `PORT` - Server port (default: 8080)

## Screenshots 📸

### Home Page
Clean and modern interface with property listings

### Property Details
Detailed view with images, amenities, and booking options

### User Dashboard
Manage your listings and bookings

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author 👨‍💻

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## Acknowledgments 🙏

- Bootstrap for responsive design
- Leaflet for interactive maps
- Cloudinary for image management
- MongoDB Atlas for database hosting

---

⭐ Star this repo if you found it helpful!