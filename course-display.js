// Course Display Helper
// This integrates courses.js with the UI

/**
 * Display courses in a table element
 * @param {string} trackName - Name of the track
 * @param {string} tableElementId - ID of the tbody element
 */
function displayCoursesInTable(trackName, tableElementId = 'courses-list') {
    const coursesList = document.getElementById(tableElementId);
    if (!coursesList || !window.coursesManager) {
        console.warn('Courses table or manager not found');
        return;
    }

    const courses = window.coursesManager.getTrackCourses(trackName);
    
    if (courses.length === 0) {
        coursesList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 20px;">No courses available for this track yet.</td></tr>';
        return;
    }

    coursesList.innerHTML = courses.map(course => `
        <tr>
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.students}</td>
            <td>${course.schedule}</td>
            <td><button class="btn-small btn-view">View Details</button></td>
        </tr>
    `).join('');
}

/**
 * Get courses for a specific track (returns array)
 * @param {string} trackName - Name of the track
 * @returns {Array} Array of course objects
 */
function getCoursesForTrack(trackName) {
    if (!window.coursesManager) {
        console.error('Courses manager not available');
        return [];
    }
    return window.coursesManager.getTrackCourses(trackName);
}

/**
 * Get all courses
 * @returns {Array} Array of all course objects
 */
function getAllCoursesData() {
    if (!window.coursesManager) {
        console.error('Courses manager not available');
        return [];
    }
    return window.coursesManager.getAllCourses();
}

/**
 * Initialize course display on page load
 * Call this from your student dashboard
 */
function initializeCoursesDisplay(trackName, tableElementId = 'courses-list') {
    // Wait for courses manager to load
    let attempts = 0;
    const checkInterval = setInterval(() => {
        if (window.coursesManager) {
            clearInterval(checkInterval);
            displayCoursesInTable(trackName, tableElementId);
            console.log('✅ Courses loaded for track:', trackName);
        } else if (attempts > 50) {
            clearInterval(checkInterval);
            console.error('Courses manager failed to load');
        }
        attempts++;
    }, 100);
}

// Expose globally
window.courseDisplay = {
    displayCoursesInTable,
    getCoursesForTrack,
    getAllCoursesData,
    initializeCoursesDisplay
};
