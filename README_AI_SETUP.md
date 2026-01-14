# AI Feature Setup Instructions

## Overview
The AI feature was previously not working because the application was attempting to use the Google Gemini API key directly in the frontend, which is insecure and doesn't work in browser environments. We've implemented a secure backend proxy solution.

## How It Works Now
1. Frontend makes requests to `/api/ai` or `/api/chat` endpoints
2. These requests are proxied to the backend server (running on port 5000)
3. Backend securely accesses the API key from environment variables
4. Backend makes the actual request to Google Gemini API
5. Response is sent back to frontend through the proxy

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then edit the `.env` file and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run the Application
The application now runs both the frontend and backend servers:

For development:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API server on http://localhost:5000

The Vite proxy will forward `/api/*` requests from the frontend to the backend.

For production:
```bash
npm run build
npm start
```

## Architecture Changes Made

### Backend Server (`/server/index.js`)
- Created Express server to handle AI requests
- Implements `/api/ai` endpoint for general AI requests
- Implements `/api/chat` endpoint for chat-specific requests with role-based instructions
- Securely accesses API key from environment variables

### Frontend Updates
- Modified `AIService.ts` to make requests to local `/api/*` endpoints instead of Google API directly
- Removed direct dependency on `@google/genai` in frontend code
- Maintained the same interface so no changes needed in components

### Vite Configuration
- Added proxy configuration to forward `/api/*` requests to backend server
- Maintains existing environment variable definitions

## Troubleshooting

### Common Issues:

1. **API Key Not Found**: Make sure you've created a `.env` file with a valid `GEMINI_API_KEY`

2. **Backend Server Not Running**: Check that the backend server started on port 5000

3. **Network Error**: Verify that the proxy is correctly forwarding requests from frontend to backend

4. **CORS Issues**: The backend includes CORS middleware to handle cross-origin requests

### Testing the API:
You can test the backend API directly by sending a POST request to `http://localhost:5000/api/ai` with a JSON body containing a `prompt` field.

## Security Notes
- The API key is no longer exposed in the frontend code
- All AI requests go through the secure backend proxy
- The frontend only communicates with the local backend, which handles the external API communication