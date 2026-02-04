// Course Management System - Using Server API
// Stores courses using backend API at /api/courses

const API_BASE_URL = window.location.origin;

// Cache for courses data
let coursesCache = {
  data: {},
  lastFetch: null
};

// Get all courses (optionally filtered by track)
async function fetchAllCourses(track = null) {
  try {
    const url = track 
      ? `${API_BASE_URL}/api/courses?track=${track}`
      : `${API_BASE_URL}/api/courses`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    console.log('✅ Courses fetched from server:', result.total);
    return result.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Get courses for a specific track
async function getTrackCourses(trackName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/track/${trackName}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.total} courses for track: ${trackName}`);
    return result.courses || [];
  } catch (error) {
    console.error(`Error fetching courses for track ${trackName}:`, error);
    return [];
  }
}

// Add a new course to a track
async function addCourse(trackName, courseData) {
  try {
    const payload = {
      track: trackName,
      code: courseData.code,
      name: courseData.name,
      description: courseData.description || '',
      instructor: courseData.instructor || 'TBA',
      schedule: courseData.schedule || '',
      students: courseData.students || 0
    };
    
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Course added to ${trackName}:`, result.course);
    return result.course;
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
}

// Update a course
async function updateCourse(courseId, courseData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Course ${courseId} updated`);
    return result.course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

// Delete a course
async function deleteCourse(trackName, courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    console.log(`✅ Course deleted from ${trackName}`);
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// Get all courses across all tracks
async function getAllCourses() {
  return fetchAllCourses();
}

// Get all available tracks
function getAvailableTracks() {
  return [
    'fullstack',
    'animation',
    'webdev',
    'mobiledev',
    'datascience',
    'cybersecurity',
    'cloud',
    'ai',
    'marketing',
    'uiux'
  ];
}

// Expose functions globally
window.coursesManager = {
  fetchAllCourses,
  getTrackCourses,
  addCourse,
  deleteCourse,
  updateCourse,
  getAllCourses,
  getAvailableTracks
};
