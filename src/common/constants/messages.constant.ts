/**
 * Application Messages
 * Standardized success and error messages
 */

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTRATION_SUCCESSFUL: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',

  // User
  PROFILE_RETRIEVED: 'User profile retrieved successfully',
  STATUS_UPDATED: 'User status updated successfully',
  USERS_RETRIEVED: 'Users retrieved successfully',
  SEARCH_RESULTS_RETRIEVED: 'Search results retrieved successfully',

  // Chat
  CHAT_CREATED: 'Chat created successfully',
  CHATS_RETRIEVED: 'Chats retrieved successfully',
  CHAT_RETRIEVED: 'Chat retrieved successfully',
  PARTICIPANTS_ADDED: 'Participants added successfully',
  CHAT_LEFT: 'Left chat successfully',

  // Message
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGES_RETRIEVED: 'Messages retrieved successfully',
  MESSAGE_READ: 'Message marked as read',

  // AI
  AI_RESPONSE_GENERATED: 'AI response generated successfully',
} as const;

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_ALREADY_EXISTS: 'User with this email already exists',
  UNAUTHORIZED: 'Unauthorized access',
  ACCOUNT_INACTIVE: 'Account is inactive',
  GOOGLE_AUTH_FAILED: 'Google authentication failed',

  // User
  USER_NOT_FOUND: 'User not found',

  // Chat
  CHAT_NOT_FOUND: 'Chat not found',
  NOT_PARTICIPANT: 'You are not a participant of this chat',
  INVALID_CHAT_TYPE: 'Direct chats must have exactly 2 participants',
  CANNOT_ADD_TO_DIRECT: 'Cannot add participants to direct chats',

  // Message
  MESSAGE_NOT_FOUND: 'Message not found',

  // General
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
} as const;
