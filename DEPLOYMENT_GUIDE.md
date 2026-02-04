# APKL Learning Management System

A comprehensive web-based learning management system for teachers and students with real-time video classes, course management, and student tracking.

## Features

✨ **Teacher Portal**
- Course management and scheduling
- Live video classes with screen sharing
- Student enrollment tracking
- Assignment and grade management
- Real-time announcements

✨ **Student Portal**
- Dashboard with course overview
- Join live video classes
- Class activities tracking
- Programming lab and practice problems
- Library with course materials

✨ **Real-Time Communication**
- WebSocket-based live notifications
- WebRTC peer-to-peer video
- Screen sharing during classes
- Instant class start/end alerts

✨ **Multi-Track Support**
- UI/UX Design
- Web Development
- Mobile Development
- Full Stack Development
- Data Science
- Cybersecurity
- Cloud Computing
- AI/ML
- Animation
- Digital Marketing

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Real-time**: WebSocket, WebRTC
- **Storage**: JSON-based (local)
- **Styling**: CSS Grid, Flexbox, Modern CSS

## Prerequisites

- Node.js 14+ and npm
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Installation

```bash
git clone https://github.com/yourusername/apkl-lms.git
cd apkl-lms
npm install
```

## Running Locally

```bash
npm start
```

The application will be available at `http://localhost:5002`

## Deployment to Render

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: APKL LMS"
git remote add origin https://github.com/yourusername/apkl-lms.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign in or create an account
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select the `apkl-lms` repo
6. Render will auto-detect `render.yaml`
7. Click **"Create Web Service"**

Render will deploy your app and provide a public URL (e.g., `https://apkl-lms.onrender.com`)

## Project Structure

```
apkl-lms/
├── server.js              # Express server & WebSocket handler
├── package.json
├── render.yaml            # Render deployment config
├── .gitignore
├── teacher.html           # Teacher portal
├── student.html           # Student portal
├── index.html             # Login/registration
├── courses.json           # Course data
└── [...other files]
```

## Usage

### For Teachers

1. Register/Login on the homepage
2. View your courses on the dashboard
3. Click **"Start"** to begin a live class
4. Use camera, microphone, screen sharing controls
5. Click **"End Call"** to end the class

### For Students

1. Register/Login with your track assigned
2. View available class activities
3. Click **"Join Now"** when teacher starts a class
4. Participate in the live video session

## Security Notes

- Use environment variables for sensitive config
- Enable HTTPS in production (Render does this automatically)
- WebSocket requires authentication before subscribing

## Support

For issues or questions, open an issue on GitHub or check console errors in browser DevTools.

---

**Last Updated**: February 4, 2026  
**Version**: 1.0.0
