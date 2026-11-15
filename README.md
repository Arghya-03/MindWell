# MindWell – Mental Wellness Journal

A privacy-focused mental wellness journaling application that helps users record their daily thoughts, track moods, monitor emotional well-being, and practice mindfulness.

MindWell combines secure journal storage, mood analytics, wellness tools, and premium features in a calming and user-friendly interface.

## Features

### 1. Secure Journaling
- Create, edit, view, and delete journal entries.
- Guided journaling and gratitude prompts.
- Journal content encrypted before being stored in MongoDB.
- Decryption performed on the server for authorized users.
- Search journal entries by keyword and date (Premium).

### 2. Mood Tracking and Analytics
- Daily mood check-ins.
- Energy-level tracking.
- Emotion selection.
- Mood trends over time.
- Mood and emotion visualizations.
- Premium wellness insights and analytics.

### 3. Wellness Tools
- Guided 4-7-8 breathing exercise.
- Animated breathing assistant.
- Light and dark themes.
- Responsive and calming user interface.

### 4. Authentication and Security
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- HTTP security headers using Helmet.
- API rate limiting.
- Configurable CORS restrictions.

### 5. Premium Features
- Advanced mood analytics.
- Historical journal search.
- Premium access management.
- Razorpay payment integration.

### 6. Data Export
- Export journal entries as JSON.
- Export journal entries as PDF.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS
- Framer Motion
- Chart.js
- Axios
- React Router
- jsPDF

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Helmet
- express-rate-limit
- Razorpay

**Security**
- AES-256-GCM encryption
- bcrypt password hashing
- JWT authentication

## Project Structure

```text
MindWell/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .gitignore
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- MongoDB Atlas account or MongoDB instance
- Razorpay account for payment integration

### 1. Clone the repository

```bash
git clone https://github.com/Arghya-03/MindWell.git
cd MindWell
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_64_character_hex_key
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Generate a unique 32-byte encryption key and store its hexadecimal representation in `ENCRYPTION_KEY`.

**Important:** Never commit your actual `.env` file or expose your encryption key, JWT secret, MongoDB credentials, or Razorpay secret.

### 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 5. Install frontend dependencies

Open another terminal:

```bash
cd MindWell/client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## Encryption Strategy

MindWell uses AES-256-GCM encryption to protect journal content before it is stored in MongoDB.

The encryption process:

1. The user submits a journal entry.
2. The backend generates a fresh random 12-byte initialization vector (IV).
3. The journal content is encrypted using AES-256-GCM.
4. The encrypted content, IV, and authentication tag are stored in MongoDB.
5. When an authorized user retrieves the entry, the backend verifies and decrypts the content.

The encryption key is stored in the backend environment configuration and is not stored alongside journal entries.

This is server-side encryption at rest, not end-to-end encryption.

## API Overview

The backend provides the following API route groups:

| Route | Purpose |
|---|---|
| `/api/auth` | Registration, login, and user profile |
| `/api/journals` | Journal management |
| `/api/moods` | Mood tracking and analytics |
| `/api/mood-checkins` | Daily mood check-ins |
| `/api/payments` | Razorpay payment integration |

Protected endpoints require a valid JWT bearer token.

## Security Considerations

- Passwords are hashed using bcrypt.
- Journal content is encrypted using AES-256-GCM.
- Authentication uses JWT.
- Protected routes verify user identity.
- Journal access is restricted to the authenticated user.
- Helmet adds HTTP security headers.
- Rate limiting helps reduce repeated requests.
- Environment variables keep sensitive configuration outside source control.

## Screenshots

Application screenshots and database encryption evidence will be added here.

## Future Improvements

- Production deployment and hosting.
- Enhanced wellness analytics.
- Improved journal search and filtering.
- Additional mindfulness exercises.
- Further security and performance improvements.

## Author

**Arghya Maji**

GitHub: https://github.com/Arghya-03

## License

This project was developed for educational and internship purposes.
