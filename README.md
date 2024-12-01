# Production Grade Express.js Backend

A production-ready Express.js backend starter with authentication, MongoDB, Redis caching, Socket.IO, Swagger documentation, and comprehensive testing.

## Features

- 🔐 Authentication with JWT
- 📦 MongoDB with Mongoose ODM
- 🚀 Redis caching
- 📝 Swagger API documentation
- 🔄 Socket.IO for real-time communication
- ✅ Jest testing setup
- 📝 Winston logging
- 🛡️ Security middleware (helmet, rate limiting, CORS)
- 🏗️ MVC architecture

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

Access the Swagger documentation at `/api-docs` when the server is running.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── socket/         # Socket.IO handlers
├── utils/          # Utility functions
└── server.js       # Application entry point
```

## Testing

Tests are written using Jest and Supertest. Run tests with:

```bash
npm test
```

## Security

This starter includes several security features:
- Helmet for secure headers
- Rate limiting
- CORS protection
- JWT authentication
- Password hashing with bcrypt

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request