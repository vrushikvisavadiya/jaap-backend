# JAAP Backend - Complete Setup Guide

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Firebase project with Cloud Messaging enabled

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd jaap-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Configuration
FIREBASE_KEY_PATH=public/your-firebase-credentials.json
```

**Important:**

- Replace `MONGO_URI` with your actual MongoDB connection string
- Generate a strong random string for `JWT_SECRET`
- Set `FIREBASE_KEY_PATH` to match your Firebase credentials file name

### 3. Firebase Setup

#### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Enable **Cloud Messaging** in Project Settings
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key**
6. Download the JSON file

#### Add Credentials to Project

```bash
# Copy the downloaded file to public/ directory
cp ~/Downloads/your-project-firebase-adminsdk-xxxxx.json public/

# Update .env with the correct filename
# FIREBASE_KEY_PATH=public/your-project-firebase-adminsdk-xxxxx.json
```

**Security Note:** The Firebase credentials file is automatically ignored by Git. Never commit it!

### 4. Database Setup

Your MongoDB database will be automatically created when you first run the application. The connection is configured in `src/config/database.config.ts`.

### 5. Create First Admin

Before starting the server, create your first admin user:

```bash
npm run create-admin admin YourSecurePassword123
```

You should see:

```
✅ Admin created successfully!
Username: admin
ID: 507f1f77bcf86cd799439011
```

### 6. Start the Server

#### Development Mode (with hot reload)

```bash
npm run start:dev
```

#### Production Mode

```bash
npm run build
npm run start:prod
```

You should see:

```
✅ NestJS app running with MongoDB connected!
```

### 7. Test the API

#### Using cURL

**Login:**

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecurePassword123"}'
```

**Get Messages:**

```bash
curl http://localhost:3000/api/messages
```

#### Using Postman

1. Import `postman_collection.json` into Postman
2. The collection includes all endpoints with examples
3. Login endpoint automatically saves the JWT token
4. All protected endpoints use the saved token automatically

See `POSTMAN_GUIDE.md` for detailed instructions.

## 📁 Project Structure

```
jaap-backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   └── interceptors/    # Response interceptors
│   ├── config/              # Configuration files
│   ├── cron/                # Scheduled jobs
│   ├── modules/
│   │   ├── auth/            # Authentication module
│   │   └── message/         # Message module
│   ├── scripts/             # CLI scripts
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry
├── public/                  # Firebase credentials (gitignored)
├── test/                    # Test files
├── .env                     # Environment variables (gitignored)
├── postman_collection.json  # API testing collection
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Production
npm run build              # Build the project
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Generate coverage report

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Admin Management
npm run create-admin <username> <password>  # Create admin user
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use a secure MongoDB connection string with authentication
- [ ] Never commit `.env` file or Firebase credentials
- [ ] Use HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Use environment-specific Firebase projects
- [ ] Rotate JWT secrets regularly
- [ ] Implement proper backup strategy for MongoDB

## 🌐 API Endpoints

### Authentication

- `POST /api/admin/register` - Create admin user
- `POST /api/admin/login` - Admin login (returns JWT)

### Messages

- `GET /api/messages` - Get all messages (public)
- `POST /api/messages` - Create message (protected)
- `DELETE /api/messages/:id` - Delete message (protected)
- `PUT /api/messages/:id/pin` - Toggle pin (protected)

### Admin

- `GET /api/messages/admin/history` - Get last 2 days messages (protected)

**Protected** = Requires JWT token in Authorization header

## 📊 Features

### ✅ Implemented Features

1. **Admin Authentication**
   - JWT-based authentication
   - Secure password hashing (bcrypt with 12 rounds)
   - Token expiration (7 days)

2. **Message Management**
   - Create instant or scheduled messages
   - Pin/unpin messages
   - Delete messages
   - Auto-delete old messages (>2 days, except pinned)

3. **Push Notifications**
   - Firebase Cloud Messaging integration
   - Custom notification sound
   - Optional link in notifications

4. **Scheduler**
   - Runs every minute
   - Sends scheduled messages
   - Auto-deletes old messages
   - Preserves pinned messages

5. **API Response Format**
   - Consistent response structure
   - Global error handling
   - Proper HTTP status codes

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseError: The uri parameter to openUri() must be a string`

**Solution:** Check your `MONGO_URI` in `.env` file. Make sure it's properly formatted.

### Firebase Initialization Error

**Error:** `FIREBASE_KEY_PATH is not defined in .env`

**Solution:**

1. Make sure you have the Firebase credentials file in `public/` directory
2. Update `FIREBASE_KEY_PATH` in `.env` to match the filename

### JWT Authentication Fails

**Error:** `401 Unauthorized`

**Solutions:**

1. Make sure you're logged in and have a valid token
2. Check if `JWT_SECRET` in `.env` matches the one used to generate the token
3. Verify the token hasn't expired (7 days validity)
4. Restart the server after changing `.env` file

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env
PORT=3001
```

### Scheduler Not Running

**Issue:** Scheduled messages not being sent

**Solutions:**

1. Check server logs for scheduler initialization
2. Verify Firebase credentials are correct
3. Check if messages have correct `scheduledAt` date
4. Ensure `isSent` is false for pending messages

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP_GUIDE.md` - This file
- `ADMIN_SETUP.md` - Admin creation guide
- `POSTMAN_GUIDE.md` - API testing guide
- `API_RESPONSE_FORMAT.md` - Response format documentation
- `PROJECT_STATUS.md` - Feature completion status
- `public/README.md` - Firebase credentials setup

## 🔄 Development Workflow

1. **Make Changes**

   ```bash
   # Edit files in src/
   # Server auto-reloads in dev mode
   ```

2. **Test Changes**

   ```bash
   # Use Postman collection
   # Or run automated tests
   npm run test
   ```

3. **Format Code**

   ```bash
   npm run format
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/prod-db
JWT_SECRET=very-long-random-string-for-production
FIREBASE_KEY_PATH=public/production-firebase-credentials.json
```

### Build and Deploy

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

### Recommended Hosting Platforms

- **Heroku** - Easy deployment with Git
- **AWS EC2** - Full control
- **DigitalOcean** - Simple and affordable
- **Google Cloud Run** - Serverless option
- **Railway** - Modern deployment platform

## 📞 Support

For issues or questions:

- Check the troubleshooting section above
- Review the documentation files
- Check server logs for detailed error messages
- Test with Postman collection to isolate issues

## 🎉 You're All Set!

Your JAAP Backend is now ready to use. Start building amazing features!

For API testing, import the Postman collection and follow the `POSTMAN_GUIDE.md`.
