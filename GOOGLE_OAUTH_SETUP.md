# Google OAuth Setup

This application supports Google OAuth authentication alongside traditional email/password authentication.

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure the consent screen if needed
   - Set application type to "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - Your production domain (for production)
   - Copy the Client ID

### 2. Frontend Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Google Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
   ```

### 3. Backend API Integration

The frontend sends Google ID tokens to your backend API endpoint:

```
POST /api/google-auth/
{
  "id_token": "google_id_token_from_frontend"
}
```

Expected response:
```json
{
  "success": true,
  "user_id": 123,
  "username": "user@example.com",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "token": "abc123...",
  "auth_method": "google",
  "created": true
}
```

## Features

- **Seamless Authentication**: Users can sign in or sign up with Google with one click
- **Account Creation**: New users are automatically created when signing in with Google
- **User Profile**: Google profile pictures and names are displayed in the interface
- **Security**: Uses Google's secure OAuth 2.0 flow
- **Fallback**: Traditional email/password authentication still available

## Usage

1. Users click "Sign in with Google" or "Sign up with Google"
2. Google popup opens for authentication
3. User authenticates with Google
4. Frontend receives ID token and sends it to backend
5. Backend validates token and creates/finds user account
6. User is logged in and redirected to dashboard

## Security Notes

- ID tokens are verified on the backend
- Users created via Google OAuth have their `auth_method` set to 'google'
- Google profile information is stored securely
- Tokens expire and are handled appropriately
