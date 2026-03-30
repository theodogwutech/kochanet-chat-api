# Kochanet Chat API - Collaborative Chat with AI Assistant

A real-time collaborative chat backend built with Nest.js, featuring an on-demand AI assistant powered by OpenAI.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

## Overview

This project implements a collaborative team workspace backend where users can:
- Communicate in real-time via text messages
- Create and manage chat rooms (direct and group chats)
- Invoke an AI assistant using @mentions for contextual help
- Track online/offline presence of team members
- See typing indicators in real-time
- Use voice messages (with speech-to-text capabilities)

The AI assistant acts as a helpful team member that can be summoned when needed, understanding conversation context to provide relevant assistance.

## Features

### Core Features

#### Authentication & Authorization
- Email/password authentication with secure password hashing (bcrypt)
- Google OAuth 2.0 integration for social authentication
- JWT-based session management with configurable expiration
- Protected routes using JWT strategy and guards

#### Real-Time Chat Infrastructure
- **Instant Messaging**: Messages appear instantly for all chat participants
- **Typing Indicators**: Real-time visual feedback when users are composing messages
- **Presence System**: Online/offline/away status tracking with automatic updates
- **Connection Management**: Graceful handling of disconnections and reconnections
- **State Synchronization**: Seamless chat state sync when users join mid-conversation

#### AI Assistant Integration
- **@mention Invocation**: Trigger AI responses by mentioning the assistant (e.g., "@ai your question")
- **Contextual Understanding**: AI analyzes recent conversation history (configurable context window)
- **Natural Responses**: Powered by OpenAI GPT-4, providing helpful and professional answers
- **Concurrent Handling**: Manages multiple simultaneous AI invocations across different chats
- **Error Resilience**: Graceful error handling with user-friendly fallback messages

#### Chat Management
- **Room Creation**: Create direct (1-on-1) or group chat rooms
- **Participant Management**: Add/remove users from group chats
- **Chat History**: Full message persistence with efficient pagination
- **Private/Public Chats**: Support for both private and public chat rooms
- **Permission System**: Authorization checks to ensure users only access their chats

#### Voice Features (Foundation)
- Speech-to-text transcription using OpenAI Whisper
- Text-to-speech conversion for AI responses using OpenAI TTS
- API endpoints ready for audio file integration

### Technical Features

- **Standardized Response Format**: All endpoints return `{success, code, message, data}`
- **Global Validation**: Input validation using class-validator decorators
- **Error Handling**: Centralized exception filters with consistent error responses
- **API Documentation**: Interactive Swagger/OpenAPI documentation at `/api/docs`
- **MongoDB Integration**: Efficient data models with proper indexing
- **TypeScript**: Full type safety across the codebase

## Tech Stack

### Required Technologies
- **Nest.js**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **MongoDB**: NoSQL database via Mongoose
- **Socket.io**: WebSocket library for real-time communication
- **OpenAI API**: AI assistant and voice features
- **JWT**: Token-based authentication

### Additional Libraries
- **Passport.js**: Authentication middleware
- **bcrypt**: Password hashing
- **class-validator**: Input validation
- **@nestjs/swagger**: API documentation
- **passport-google-oauth20**: Google OAuth strategy

## Architecture

### System Design

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├──── HTTP/REST ────┐
       │                   │
       └── WebSocket ──────┤
                          │
                   ┌──────▼──────┐
                   │  NestJS App │
                   │  (Gateway)  │
                   └──────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
     │  Auth   │    │  Chat   │    │   AI    │
     │ Module  │    │ Module  │    │ Module  │
     └────┬────┘    └────┬────┘    └────┬────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                   ┌──────▼──────┐
                   │   MongoDB   │
                   └─────────────┘
```

### Data Models

#### User Schema
- Email, name, password (hashed)
- Auth provider (local/google)
- Status (online/offline/away)
- Last seen timestamp

#### Chat Schema
- Name, type (direct/group)
- Participants (array of user IDs)
- Creator, privacy settings
- Last message reference
- Activity timestamp

#### Message Schema
- Chat ID, sender ID
- Content, type (text/voice/ai)
- Mentions array
- Read receipts
- Timestamps

### Real-Time Communication

Socket.io Gateway handles:
1. **Connection Management**: JWT authentication on WebSocket connect
2. **Room Management**: Users join/leave chat rooms dynamically
3. **Message Broadcasting**: Real-time message delivery to room participants
4. **Typing Indicators**: Broadcast typing state changes
5. **Presence Updates**: Track and broadcast user online/offline status
6. **AI Triggers**: Detect @mentions and trigger AI responses

### AI Integration

The AI service:
1. Detects @mentions of the AI assistant in message content
2. Retrieves recent conversation history (configurable context window)
3. Constructs a prompt with full context for OpenAI
4. Streams responses back to the chat room
5. Manages context window to stay within token limits
6. Handles errors gracefully with user-friendly messages

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or remote instance)
- OpenAI API key
- Google OAuth credentials (optional, for social auth)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kochanet-assessment
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kochanet-chat
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
```

4. **Start MongoDB**

Ensure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

5. **Run the application**

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

### Testing the API

1. **Access Swagger Documentation**

Navigate to: `http://localhost:3000/api/docs`

2. **Register a user**

POST `/auth/register`
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

3. **Login to get JWT token**

POST `/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Copy the returned token and use it for authenticated requests.

4. **Connect via WebSocket**

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.emit('chat:join', { chatId: 'your-chat-id' });
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /auth/register
Body: { email, name, password }
Response: { success, code, message, data: { user, token } }
```

#### Login
```
POST /auth/login
Body: { email, password }
Response: { success, code, message, data: { user, token } }
```

#### Google OAuth
```
GET /auth/google (Initiates OAuth flow)
GET /auth/google/callback (OAuth callback)
```

### User Endpoints (Protected)

All user endpoints require `Authorization: Bearer <token>` header.

#### Get Profile
```
GET /users/profile
Response: { success, code, message, data: user }
```

#### Update Status
```
PATCH /users/status
Body: { status: "online" | "offline" | "away" }
Response: { success, code, message, data: user }
```

#### Get All Users
```
GET /users
Response: { success, code, message, data: users[] }
```

#### Search Users
```
GET /users/search?q=john
Response: { success, code, message, data: users[] }
```

### Chat Endpoints (Protected)

#### Create Chat
```
POST /chat
Body: {
  name: string,
  type: "direct" | "group",
  participants: string[],
  isPrivate: boolean
}
Response: { success, code, message, data: chat }
```

#### Get User Chats
```
GET /chat
Response: { success, code, message, data: chats[] }
```

#### Get Chat by ID
```
GET /chat/:id
Response: { success, code, message, data: chat }
```

#### Add Participants
```
PATCH /chat/:id/participants
Body: { participants: string[] }
Response: { success, code, message, data: chat }
```

#### Leave Chat
```
DELETE /chat/:id/leave
Response: { success, code, message, data: null }
```

### Message Endpoints (Protected)

#### Send Message
```
POST /messages
Body: {
  chatId: string,
  content: string,
  type: "text" | "voice" | "ai",
  audioUrl?: string
}
Response: { success, code, message, data: message }
```

#### Get Chat Messages
```
GET /messages/chat/:chatId?limit=50&skip=0
Response: { success, code, message, data: messages[] }
```

#### Mark as Read
```
PATCH /messages/:id/read
Response: { success, code, message, data: null }
```

### AI Endpoints (Protected)

#### Transcribe Audio (Placeholder)
```
POST /ai/transcribe
Body: { audioData: string }
Response: { success, code, message, data: { text } }
```

#### Text-to-Speech (Placeholder)
```
POST /ai/text-to-speech
Body: { text: string }
Response: { success, code, message, data: { audioUrl } }
```

## WebSocket Events

### Client to Server

#### Join Chat
```javascript
socket.emit('chat:join', { chatId: string });
```

#### Leave Chat
```javascript
socket.emit('chat:leave', { chatId: string });
```

#### Send Message
```javascript
socket.emit('message:send', {
  chatId: string,
  content: string,
  type: 'text' | 'voice'
});
```

#### Start Typing
```javascript
socket.emit('typing:start', { chatId: string });
```

#### Stop Typing
```javascript
socket.emit('typing:stop', { chatId: string });
```

### Server to Client

#### New Message
```javascript
socket.on('message:new', (message) => {
  // Message object with full details
});
```

#### User Status Changed
```javascript
socket.on('user:status', ({ userId, status }) => {
  // User went online/offline/away
});
```

#### Typing Started
```javascript
socket.on('typing:start', ({ chatId, userId, userName }) => {
  // Show "userName is typing..."
});
```

#### Typing Stopped
```javascript
socket.on('typing:stop', ({ chatId, userId }) => {
  // Hide typing indicator
});
```

## Environment Variables

Required variables in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `...` |
| `GOOGLE_CALLBACK_URL` | OAuth callback | `http://localhost:3000/auth/google/callback` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3001` |
| `AI_ASSISTANT_NAME` | AI name for @mentions | `AI` |
| `AI_MODEL` | OpenAI model | `gpt-4-turbo-preview` |
| `AI_MAX_CONTEXT_MESSAGES` | Context window size | `20` |

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                 # Data transfer objects
│   ├── strategies/          # Passport strategies (JWT, Google)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                   # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── chat/                    # Chat room management
│   ├── dto/
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.module.ts
├── messages/                # Message handling
│   ├── dto/
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   └── messages.module.ts
├── ai/                      # AI integration
│   ├── ai.controller.ts
│   ├── ai.service.ts
│   └── ai.module.ts
├── gateways/                # WebSocket gateways
│   └── chat.gateway.ts
├── schemas/                 # MongoDB schemas
│   ├── user.schema.ts
│   ├── chat.schema.ts
│   └── message.schema.ts
├── common/                  # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Design Decisions

### 1. Real-Time Communication - Socket.io

**Choice**: Socket.io

**Reasoning**:
- Battle-tested library with excellent browser support
- Built-in fallbacks (WebSocket → long-polling)
- Easy room-based broadcasting for chat functionality
- Simple authentication integration via handshake
- Automatic reconnection handling

**Alternative Considered**: Native WebSockets
- Would require more boilerplate
- No built-in room management
- Manual fallback implementation

### 2. Database - MongoDB

**Choice**: MongoDB with Mongoose

**Reasoning**:
- Flexible schema for evolving chat features
- Excellent performance for real-time message storage
- Natural fit for nested documents (messages in chats)
- Easy to scale horizontally
- Rich querying capabilities with aggregation

**Tradeoffs**:
- No ACID transactions across multiple documents (acceptable for chat)
- Requires careful indexing for performance

### 3. Authentication Strategy

**Choice**: JWT + Passport

**Reasoning**:
- Stateless authentication scales well
- Works seamlessly with WebSocket connections
- Easy to integrate multiple providers (local, Google)
- Tokens can be validated without database lookup

**Tradeoffs**:
- Cannot immediately revoke tokens (requires Redis/database for blacklist)
- Tokens can grow large with embedded claims

### 4. AI Context Management

**Choice**: Last N messages (configurable)

**Reasoning**:
- Simple to implement and understand
- Predictable token usage
- Good balance of context vs. cost

**Future Enhancement**: Smart summarization of older messages

### 5. Response Structure

**Choice**: Standardized `{success, code, message, data}`

**Reasoning**:
- Consistent API contract for all endpoints
- Easy for clients to handle responses uniformly
- Clear separation of metadata and payload
- HTTP status codes still used but also included in body

### 6. Mention Detection

**Choice**: @mention pattern matching

**Reasoning**:
- Familiar pattern from Slack, Discord
- Simple regex implementation
- Low computational overhead
- Easy to extend with autocomplete

### 7. Typing Indicators

**Choice**: Event-based with no database persistence

**Reasoning**:
- Ephemeral state doesn't need storage
- Real-time only - no historical value
- Reduces database load significantly

## Known Limitations

### 1. Voice Features
The voice transcription and text-to-speech endpoints are implemented but require:
- File upload middleware integration
- Audio file storage (S3, Cloudinary, etc.)
- Proper audio format validation

**Workaround**: API structure is ready; needs storage layer integration.

### 2. Google OAuth
Requires valid Google OAuth credentials to test.

**Workaround**: Use email/password authentication for testing.

### 3. Message Editing
Currently not supported. Messages are immutable once sent.

**Future**: Add edit functionality with version history.

### 4. Read Receipts
Basic implementation exists but not exposed via WebSocket events.

**Future**: Emit read receipt events to all chat participants.

### 5. File Attachments
Only text and voice messages supported. No images/documents.

**Future**: Add file upload service and attachment handling.

### 6. Message Search
Full-text search within conversations not implemented.

**Future**: Add MongoDB text indexes and search endpoints.

### 7. Rate Limiting
No rate limiting on API or WebSocket events.

**Production Requirement**: Add @nestjs/throttler for protection.

### 8. Deployment Configuration
Application ready for deployment but requires:
- Production MongoDB instance
- Environment-specific configuration
- Process manager (PM2) or containerization (Docker)

## Future Improvements

### With More Time

#### High Priority
1. **Comprehensive Testing**
   - Unit tests for all services
   - Integration tests for API endpoints
   - E2E tests for WebSocket flows
   - Test coverage > 80%

2. **Advanced AI Features**
   - Streaming AI responses (show as typing)
   - Smart context summarization for long conversations
   - AI personality customization per workspace
   - Multiple AI assistants with different expertise

3. **Production Hardening**
   - Rate limiting and throttling
   - Request logging and monitoring
   - Error tracking (Sentry)
   - Performance monitoring (APM)

4. **Security Enhancements**
   - Token refresh mechanism
   - Token blacklisting for logout
   - 2FA authentication
   - Audit logs for sensitive actions

#### Medium Priority
5. **User Experience**
   - Message reactions (emojis)
   - Threaded conversations
   - Message pinning
   - User @mentions autocomplete

6. **Chat Features**
   - Message editing with history
   - Message deletion (soft delete)
   - Chat archiving
   - Starred/favorite chats

7. **Voice Enhancements**
   - Real-time voice streaming
   - Voice message waveform visualization
   - Playback speed control

8. **Search & Discovery**
   - Full-text message search
   - User search with filters
   - Chat history export

#### Nice to Have
9. **Integrations**
   - More OAuth providers (GitHub, Microsoft)
   - Webhook support for external services
   - Bot API for custom integrations

10. **Analytics**
    - Message statistics
    - User activity metrics
    - AI usage analytics
    - Chat engagement scores

11. **Mobile Optimization**
    - Push notifications
    - Background message sync
    - Offline mode support

## Deployment

### Recommended Stack

- **Hosting**: Railway, Render, or Heroku
- **Database**: MongoDB Atlas (free tier available)
- **Environment**: Production-ready .env configuration

### Quick Deploy Steps

1. Set up MongoDB Atlas cluster
2. Create application on hosting platform
3. Configure environment variables
4. Push code and deploy
5. Test all endpoints and WebSocket connections

## Development

### Running in Development

```bash
npm run start:dev
```

### Building for Production

```bash
npm run build
npm run start:prod
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Support

For questions or issues, please:
1. Check the Swagger documentation at `/api/docs`
2. Review this README
3. Check the code comments for implementation details

## License

This project was created as a technical assessment for Kochanet.

---

**Built with**: Nest.js, MongoDB, Socket.io, OpenAI API, TypeScript

**Author**: Valentine Offiah

**Date**: March 2026
