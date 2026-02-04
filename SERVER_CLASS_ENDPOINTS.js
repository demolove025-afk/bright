// Add these endpoints to server.js after the existing class endpoints

// ==================== ACTIVE CLASS SESSIONS (Add to server.js) ====================

// Map to store active class sessions: meetingId -> { courseCode, teacherId, startedAt, screenSharing, participants: Set }
// const activeClasses = new Map(); // Add this near the top with other Map declarations

// Get all active class sessions
app.get('/api/classes/active', (req, res) => {
  try {
    const activeSessions = [];
    activeClasses.forEach((session, meetingId) => {
      activeSessions.push({
        meetingId,
        courseCode: session.courseCode,
        teacherId: session.teacherId,
        startedAt: session.startedAt,
        screenSharing: session.screenSharing,
        participantCount: session.participants.size
      });
    });
    res.json({ success: true, activeSessions });
  } catch (err) {
    console.error('Error fetching active classes:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get active class by meeting ID
app.get('/api/classes/active/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const session = activeClasses.get(meetingId);
    
    if (!session) {
      return res.json({ success: false, message: 'Class not found', session: null });
    }
    
    res.json({ 
      success: true, 
      session: {
        meetingId,
        courseCode: session.courseCode,
        teacherId: session.teacherId,
        startedAt: session.startedAt,
        screenSharing: session.screenSharing,
        participantCount: session.participants.size
      }
    });
  } catch (err) {
    console.error('Error fetching active class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start a new class session (called by teacher)
app.post('/api/classes/start', (req, res) => {
  try {
    const { courseCode, meetingId, teacherId } = req.body;
    
    if (!courseCode || !meetingId || !teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing courseCode, meetingId, or teacherId' 
      });
    }
    
    // Create new active class session
    activeClasses.set(meetingId, {
      courseCode,
      teacherId,
      startedAt: new Date().toISOString(),
      screenSharing: false,
      participants: new Set([teacherId])  // Initialize with teacher
    });
    
    console.log(`✅ Class started: ${courseCode} (${meetingId})`);
    
    // Broadcast to all connected users that a new class has started
    broadcastToAll({
      type: 'class_started',
      courseCode,
      meetingId,
      teacherId
    });
    
    res.json({ 
      success: true, 
      message: 'Class session created',
      session: {
        meetingId,
        courseCode,
        teacherId,
        screenSharing: false
      }
    });
  } catch (err) {
    console.error('Error starting class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// End a class session (called by teacher)
app.post('/api/classes/end', (req, res) => {
  try {
    const { meetingId, courseCode, teacherId } = req.body;
    
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId' });
    }
    
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found' });
    }
    
    // Remove the class session
    activeClasses.delete(meetingId);
    
    console.log(`✅ Class ended: ${courseCode} (${meetingId})`);
    
    // Broadcast to all users that the class has ended
    broadcastToAll({
      type: 'class_ended',
      meetingId,
      courseCode
    });
    
    res.json({ 
      success: true, 
      message: 'Class session ended'
    });
  } catch (err) {
    console.error('Error ending class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student joins class (add to participant list)
app.post('/api/classes/join', (req, res) => {
  try {
    const { meetingId, studentId, courseCode } = req.body;
    
    if (!meetingId || !studentId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId or studentId' });
    }
    
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.json({ 
        success: false, 
        message: 'Class not active',
        classActive: false 
      });
    }
    
    // Add student to participants
    session.participants.add(studentId);
    
    console.log(`✅ Student joined: ${studentId} to ${courseCode} (${meetingId})`);
    
    // Broadcast to teacher that a student joined
    const teacherWs = connectedUsers.get(session.teacherId);
    if (teacherWs && teacherWs.readyState === WebSocket.OPEN) {
      teacherWs.send(JSON.stringify({
        type: 'student_joined',
        meetingId,
        studentId,
        totalParticipants: session.participants.size
      }));
    }
    
    res.json({ 
      success: true,
      message: 'Joined class',
      classActive: true,
      participantCount: session.participants.size
    });
  } catch (err) {
    console.error('Error joining class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update screen share status
app.post('/api/classes/screen-share', (req, res) => {
  try {
    const { meetingId, isSharing } = req.body;
    
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId' });
    }
    
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found' });
    }
    
    session.screenSharing = isSharing;
    
    console.log(`${isSharing ? '📺' : '⊘'} Screen share ${isSharing ? 'started' : 'stopped'} for ${meetingId}`);
    
    // Broadcast to all participants
    broadcastToAll({
      type: 'screen_share_update',
      meetingId,
      isSharing
    });
    
    res.json({ 
      success: true,
      message: isSharing ? 'Screen sharing started' : 'Screen sharing stopped'
    });
  } catch (err) {
    console.error('Error updating screen share:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper function to broadcast to all connected users
function broadcastToAll(message) {
  connectedUsers.forEach((ws, userId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// ==================== END OF NEW ENDPOINTS ====================
