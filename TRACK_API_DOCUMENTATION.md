# Track & Duration API Endpoints

## Overview
The server now handles track and duration data from `track&duration.json` and exposes it through REST API endpoints for users, students, and teachers to consume.

---

## API Endpoints

### 1. **Get All Available Tracks**
```
GET /api/tracks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ui-ux",
      "code": "UX101",
      "name": "UI/UX Design",
      "duration": "500",
      "description": "Learn to design beautiful and user-friendly interfaces",
      "courses": [...]
    },
    ...
  ],
  "metadata": {
    "lastUpdated": "2026-01-29",
    "totalTracks": 10,
    "version": "1.0"
  }
}
```

**Use Case:** Display all available tracks on registration page

---

### 2. **Get Specific Track by ID**
```
GET /api/tracks/:trackId
```

**Example:**
```
GET /api/tracks/ui-ux
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ui-ux",
    "code": "UX101",
    "name": "UI/UX Design",
    "duration": "500",
    "description": "Learn to design beautiful and user-friendly interfaces",
    "courses": [
      {
        "code": "UI101",
        "name": "UI Design Fundamentals",
        "instructor": "Design Team",
        "level": "Beginner"
      },
      ...
    ]
  }
}
```

**Use Case:** Show track details when student clicks on a track

---

### 3. **Get Track by Name**
```
GET /api/tracks-by-name/:trackName
```

**Example:**
```
GET /api/tracks-by-name/Web%20Development
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "web-dev",
    "code": "WD101",
    "name": "Web Development",
    "duration": "550",
    ...
  }
}
```

**Use Case:** Validate student's selected track during registration

---

### 4. **Get Courses in a Track**
```
GET /api/tracks/:trackId/courses
```

**Example:**
```
GET /api/tracks/web-dev/courses
```

**Response:**
```json
{
  "success": true,
  "trackName": "Web Development",
  "courses": [
    {
      "code": "WD101",
      "name": "Frontend Fundamentals",
      "instructor": "Web Team",
      "level": "Beginner"
    },
    {
      "code": "WD102",
      "name": "Backend Development",
      "instructor": "Web Team",
      "level": "Intermediate"
    },
    {
      "code": "WD103",
      "name": "Database Design",
      "instructor": "Web Team",
      "level": "Intermediate"
    }
  ]
}
```

**Use Case:** Show available courses when student enrolls in a track

---

### 5. **Get Tracks Metadata & Statistics**
```
GET /api/tracks-metadata
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTracks": 10,
    "totalCourses": 30,
    "tracks": [
      {
        "id": "ui-ux",
        "name": "UI/UX Design",
        "code": "UX101",
        "duration": "500",
        "courseCount": 3
      },
      {
        "id": "web-dev",
        "name": "Web Development",
        "code": "WD101",
        "duration": "550",
        "courseCount": 3
      },
      ...
    ],
    "lastUpdated": "2026-01-29",
    "version": "1.0"
  }
}
```

**Use Case:** Display track statistics on admin dashboard

---

## Integration Examples

### Frontend - Get All Tracks
```javascript
// When registration page loads
async function loadTracks() {
  try {
    const response = await fetch('/api/tracks');
    const result = await response.json();
    
    if (result.success) {
      displayTracksInDropdown(result.data);
    }
  } catch (error) {
    console.error('Error loading tracks:', error);
  }
}
```

### Frontend - Validate Selected Track
```javascript
// When student submits registration form
async function validateAndRegisterTrack(trackName) {
  try {
    const response = await fetch(`/api/tracks-by-name/${encodeURIComponent(trackName)}`);
    const result = await response.json();
    
    if (result.success) {
      // Track is valid, proceed with registration
      registerStudent(result.data);
    } else {
      alert('Invalid track selected');
    }
  } catch (error) {
    console.error('Error validating track:', error);
  }
}
```

### Frontend - Get Track Courses
```javascript
// When student needs to see available courses
async function loadTrackCourses(trackId) {
  try {
    const response = await fetch(`/api/tracks/${trackId}/courses`);
    const result = await response.json();
    
    if (result.success) {
      displayCoursesInTable(result.courses);
    }
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}
```

### Frontend - Display Track Statistics
```javascript
// Admin dashboard
async function loadTrackStatistics() {
  try {
    const response = await fetch('/api/tracks-metadata');
    const result = await response.json();
    
    if (result.success) {
      displayStatistics(result.data);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**Common Status Codes:**
- `200` - Success
- `404` - Track/Resource not found
- `500` - Server error

---

## Data Flow

```
┌─────────────────────────┐
│  track&duration.json    │
│  (File on server)       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  readTracksJSON()       │
│  (Helper function)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  API Endpoints          │
│  /api/tracks*           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Frontend (Student/     │
│   Teacher/Admin)        │
└─────────────────────────┘
```

---

## Available Tracks (Summary)

| ID | Name | Code | Duration | Courses |
|---|---|---|---|---|
| ui-ux | UI/UX Design | UX101 | 500 | 3 |
| web-dev | Web Development | WD101 | 550 | 3 |
| mobile-dev | Mobile Development | MD101 | 600 | 3 |
| fullstack | Fullstack Development | FS101 | 700 | 3 |
| data-science | Data Science | DS101 | 750 | 3 |
| cybersecurity | Cybersecurity | CS101 | 800 | 3 |
| cloud-computing | Cloud Computing | CC101 | 650 | 3 |
| ai | Artificial Intelligence | AI101 | 900 | 3 |
| animation | Animation | AN101 | 550 | 3 |
| digital-marketing | Digital Marketing | DM101 | 400 | 3 |

---

## Testing the API

### Using cURL
```bash
# Get all tracks
curl http://localhost:5001/api/tracks

# Get specific track
curl http://localhost:5001/api/tracks/web-dev

# Get track metadata
curl http://localhost:5001/api/tracks-metadata

# Get courses in track
curl http://localhost:5001/api/tracks/web-dev/courses
```

### Using Browser
Just visit these URLs in your browser:
- http://localhost:5001/api/tracks
- http://localhost:5001/api/tracks/web-dev
- http://localhost:5001/api/tracks-metadata

---

## Notes

✅ Server reads from `track&duration.json` file  
✅ No database queries needed for track data  
✅ Fast and efficient static data serving  
✅ Can be cached on frontend for better performance  
✅ Easy to update track data - just modify JSON file  

---

## Future Enhancements

- Add endpoint to update tracks (admin only)
- Add course-level endpoints
- Add enrollment tracking
- Add progress tracking per track
