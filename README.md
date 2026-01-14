<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DIN Properties Customer Portal with AI Assistant

This is a comprehensive real estate customer portal with integrated AI assistant functionality. The application has been enhanced with a secure backend proxy to handle AI requests safely.

## Features

- Real estate property management dashboard
- AI-powered chat assistant for property inquiries
- Secure authentication system
- Property file management
- Financial reporting and statements

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   
   ```
   
   Then edit the `.env` file and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Run the app (starts both frontend and backend servers):
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000 with the backend API running on http://localhost:5000.

## Architecture

This application now uses a secure backend proxy for AI requests:
- Frontend communicates with local `/api/*` endpoints
- Vite proxy forwards requests to the backend server
- Backend server securely accesses the API key and communicates with Google Gemini API
- This prevents exposing the API key in the browser

For more details on the AI setup, see [README_AI_SETUP.md](README_AI_SETUP.md).

## Production Deployment

To build and run in production:
```bash
npm run build
npm start
```
