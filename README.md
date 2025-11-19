# Venture-X 🚀

**A Modern Investment Platform Connecting Startups with Investors**

Venture-X is a comprehensive full-stack web application that bridges the gap between innovative startups seeking funding and investors looking for promising opportunities. The platform provides a seamless experience for startup founders to showcase their companies, raise capital, and connect with potential investors through an intuitive and feature-rich interface.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Core Functionality](#core-functionality)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Highlights](#highlights)

---

## 🎯 Overview

Venture-X is designed to democratize startup funding by providing:

- **For Startups**: A professional platform to create compelling fundraising campaigns, manage funding rounds, and connect with investors
- **For Investors**: A curated marketplace to discover, evaluate, and invest in promising startups across various industries

The platform combines social features, real-time communication, and comprehensive company profiles to facilitate meaningful connections between founders and investors.

---

## ✨ Key Features

### 🏢 For Startups

- **Complete Company Profiles**

  - Rich text editor for detailed company descriptions
  - Upload company logos, cover photos, and promotional videos
  - Industry categorization and location tagging
  - Social media integration (LinkedIn, Instagram, YouTube)

- **Fundraising Campaign Management**

  - Create and manage funding rounds with target amounts
  - Set minimum investment thresholds
  - Define campaign duration and go-live status
  - Track raised capital vs. fundraising goals

- **Team Showcase**

  - Add team members with profiles and roles
  - Highlight founders and key personnel
  - Link to professional profiles (LinkedIn)

- **Product Listings**
  - Showcase products with detailed descriptions
  - Pricing and availability information
  - Multiple product images and thumbnails

### 💼 For Investors

- **Smart Discovery**

  - Browse startups by industry categories (Technology, Healthcare, CleanTech, etc.)
  - Filter and search functionality
  - Industry-specific exploration (21+ categories)

- **Investment Management**

  - Make investments directly through the platform
  - Track investment portfolio
  - View investment history and notes

- **Watchlist Feature**

  - Save interesting startups for later review
  - Quick access to saved companies
  - Easy watchlist management

- **Direct Communication**
  - Real-time chat with startup founders
  - Automated channel creation for investor-founder conversations
  - Stream Chat integration for reliable messaging

### 👤 User Experience

- **Onboarding Flow**

  - Multi-step welcome process
  - User identity verification
  - Interest and investment plan selection
  - Public profile creation

- **Authentication & Security**

  - Supabase authentication integration
  - Protected routes and role-based access
  - Secure token-based sessions

- **Tax Documentation**
  - GST identification management
  - Document verification status
  - Compliance tracking

---

## 🛠️ Tech Stack

### Frontend

- **React** (v19.1.1) - Modern UI library
- **React Router DOM** (v7.9.3) - Client-side routing
- **Vite** - Fast build tool and development server
- **TailwindCSS** (v4.1.13) - Utility-first CSS framework
- **TinyMCE** - Rich text editor for campaign content
- **Stream Chat React** - Real-time messaging UI components
- **Axios** - HTTP client for API requests
- **React Toastify** - Elegant notifications

### Backend

- **Node.js** with **Express** (v5.1.0) - REST API server
- **MongoDB** with **Mongoose** (v8.18.3) - NoSQL database and ODM
- **Stream Chat** (v9.25.0) - Real-time messaging backend
- **ImageKit** - Image and video upload/storage service
- **Supabase** - Authentication and user management

### DevOps & Tools

- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```
TY-Mini-Project/
├── backend/                      # Node.js/Express API server
│   ├── main.js                   # Application entry point
│   ├── loadEnvironment.js        # Environment configuration
│   ├── models/                   # MongoDB/Mongoose schemas
│   │   ├── Company.js           # Startup/company data model
│   │   ├── Investment.js        # Investment records
│   │   ├── User.js              # User profiles
│   │   └── Watchlist.js         # Saved companies
│   └── routes/                   # API route handlers
│       ├── auth.js              # Authentication endpoints
│       ├── chat.js              # Messaging functionality
│       ├── company.js           # Company CRUD operations
│       ├── investment.js        # Investment management
│       ├── raiseMoney.js        # Fundraising campaigns
│       ├── upload.js            # File upload handling
│       ├── watchlist.js         # Watchlist operations
│       └── welcome.js           # Onboarding flow
│
└── Venture-X/                    # React frontend application
    ├── src/
    │   ├── App.jsx              # Main app component & routing
    │   ├── main.jsx             # React entry point
    │   ├── components/          # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   └── WelcomeNavbar.jsx
    │   ├── lib/                 # Utilities and context
    │   │   ├── api.js           # API client functions
    │   │   ├── AuthContext.jsx  # Authentication state
    │   │   ├── StreamChatContext.jsx
    │   │   └── supabaseClient.js
    │   └── Pages/               # Application pages
    │       ├── LandingPage.jsx
    │       ├── LoginPage.jsx
    │       ├── SignupPage.jsx
    │       ├── ExplorePage.jsx  # Browse startups
    │       ├── CompanyPage.jsx  # Individual company view
    │       ├── WatchlistPage.jsx
    │       ├── ChatPage.jsx
    │       ├── TaxDocumentsPage.jsx
    │       ├── PublicUserProfilePage.jsx
    │       ├── Welcome/         # Onboarding steps
    │       │   ├── Identity.jsx
    │       │   ├── Interests.jsx
    │       │   ├── InvestmentPlans.jsx
    │       │   ├── PublicProfile.jsx
    │       │   └── Finish.jsx
    │       └── RaiseMoney/      # Fundraising creation
    │           ├── RaiseMoneyPage.jsx
    │           ├── RS_start.jsx
    │           ├── RaiseMoneyEditor.jsx
    │           ├── RaiseMoneyRound.jsx
    │           └── RaiseMoneyTeam.jsx
    ├── public/
    ├── index.html
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Atlas or local instance)
- **npm** or **yarn**
- **Supabase account** (for authentication)
- **Stream Chat account** (for messaging)
- **ImageKit account** (for media uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/vgarg1603/TY-Mini-Project.git
   cd TY-Mini-Project
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configure backend environment variables**
   Create a `.env` file in the `backend` directory:

   ```env
   PORT=3000
   ATLAS_URI=your_mongodb_connection_string
   DB_NAME=venture_x
   CLIENT_ORIGIN=http://localhost:5173
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```

4. **Start the backend server**

   ```bash
   npm start
   ```

5. **Set up the frontend**

   ```bash
   cd ../Venture-X
   npm install
   ```

6. **Configure frontend environment variables**
   Create a `.env` file in the `Venture-X` directory:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STREAM_API_KEY=your_stream_api_key
   ```

7. **Start the frontend development server**

   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

---

## 🎪 Core Functionality

### Authentication Flow

1. Users sign up/login via Supabase authentication
2. New users complete a multi-step onboarding process
3. Profile data is stored in MongoDB, linked via Supabase ID
4. Protected routes ensure authenticated access

### Fundraising Campaign Creation

1. Founders navigate to "Raise Money" section
2. Fill in company details (name, website, location, description)
3. Add rich HTML content using TinyMCE editor
4. Upload media assets (logo, cover photo, video)
5. Define funding round parameters (target, minimum investment, duration)
6. Add team members with profiles
7. Optionally add product listings
8. Set campaign live status

### Investment Process

1. Investors browse companies in the Explore section
2. Filter by industry categories
3. View detailed company profiles
4. Make investment decisions
5. Enter investment amount and optional notes
6. Investment recorded in database
7. Initiate chat with founder for questions

### Real-time Chat

1. Investor initiates chat from company page
2. Backend creates Stream Chat channel
3. Channel includes investor and company owner
4. Real-time bidirectional messaging
5. Channel ID stored for future conversations

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management

- `POST /api/welcome/profile` - Create/update user profile
- `GET /api/welcome/profile/:supabaseId` - Get user profile

### Company/Fundraising

- `POST /api/raise_money` - Create company campaign
- `PUT /api/raise_money/:userSupaId` - Update campaign
- `GET /api/company/:startupName` - Get company by slug
- `GET /api/company/all` - List all companies
- `GET /api/company/user/:userSupaId` - Get user's company

### Investments

- `POST /api/investment` - Create new investment
- `GET /api/investment/list` - List investments for a company

### Watchlist

- `POST /api/watchlist/toggle` - Add/remove from watchlist
- `GET /api/watchlist/:userSupaId` - Get user's watchlist

### Chat

- `POST /api/chat/token` - Generate Stream Chat token
- `POST /api/chat/channel` - Create/get chat channel

### Media Upload

- `POST /api/upload/image` - Upload image to ImageKit
- `POST /api/upload/video` - Upload video to ImageKit

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3000
CLIENT_ORIGIN=http://localhost:5173

# Database
ATLAS_URI=mongodb+srv://...
DB_NAME=venture_x

# Stream Chat
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Frontend (.env)

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stream Chat
VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 🌟 Highlights

### 🎨 Modern UI/UX

- Clean, professional interface built with TailwindCSS
- Responsive design for all device sizes
- Smooth animations and transitions
- Intuitive navigation and user flows

### ⚡ Performance

- Vite for lightning-fast development and builds
- Optimized asset loading and caching
- Efficient database queries with Mongoose
- Lazy loading of components

### 🔒 Security

- Supabase authentication with JWT tokens
- Protected API routes
- Input validation and sanitization
- Secure file upload handling
- Environment-based configuration

### 📱 Real-time Features

- Instant messaging with Stream Chat
- Live campaign updates
- Real-time investment tracking
- Collaborative features

### 🗄️ Robust Data Management

- MongoDB for flexible document storage
- Mongoose ODM for data modeling
- Indexed queries for fast lookups
- Relational data handling with references

### 🎯 Scalable Architecture

- Separation of concerns (frontend/backend)
- RESTful API design
- Modular component structure
- Easy to extend and maintain

### 🌐 Rich Media Support

- ImageKit integration for optimized image delivery
- Video upload and streaming
- Multiple image formats supported
- CDN-powered media delivery

### 📊 Comprehensive Analytics Potential

- Investment tracking infrastructure
- User engagement metrics
- Company performance data
- Ready for analytics dashboard integration

---

## 🤝 Contributing

This project was developed as part of a Third Year Mini Project. For contributions or suggestions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team

Developed by Vipul Garg, Vibhor Bagga, Rohan Singh Chauhan, Rishi Golechha as part of Third Year Engineering MERN Mini Project.

---

## 🙏 Acknowledgments

- **Supabase** - For authentication infrastructure
- **Stream** - For real-time chat capabilities
- **MongoDB Atlas** - For database hosting
- **ImageKit** - For media management
- **TinyMCE** - For rich text editing
- **React & Vite** - For modern frontend development

---

**Built with ❤️ using React, Node.js, and MongoDB**
