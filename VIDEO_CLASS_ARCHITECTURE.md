# Zoom-Like Video Class - Architecture

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Teacher Dashboard                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   Create/Edit Course     │
                    │  (code, name, schedule)  │
                    └──────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            [Generate Meeting Link]    [Start Video Class]
                    │                           │
                    ▼                           ▼
            APKL-ABC123-DEF456    ┌──────────────────────┐
                    │             │  Request Permissions │
                    │             │  (Camera + Mic)      │
                    │             └──────────────────────┘
                    │                           │
                    │             ┌─────────────▼──────────────┐
                    │             │   Initialize Streams       │
                    │             │   - getUserMedia()         │
                    │             │   - getDisplayMedia()      │
                    │             └──────────────────────┬─────┘
                    │                                     │
                    │      ┌──────────────────────────────▼─────────────────────┐
                    │      │      Video Call Modal Opens                        │
                    │      ├──────────────────────────────────────────────────┐ │
                    │      │ Header: Course Name + Meeting ID (APKL-ABC123)  │ │
                    │      ├──────────────────────────────────────────────────┤ │
                    │      │ Video Grid:                                      │ │
                    │      │  ┌────────────────────────────────────────────┐ │ │
                    │      │  │ Teacher Video (Highlighted)                │ │ │
                    │      │  │ 🎥 Camera Feed                             │ │ │
                    │      │  │ [You (Teacher)]                            │ │ │
                    │      │  └────────────────────────────────────────────┘ │ │
                    │      ├──────────────────────────────────────────────────┤ │
                    │      │ Control Bar (Bottom):                            │ │
                    │      │  [📹] [🎤] [🖥️] [💬] [👥] [📞]                   │ │
                    │      │ Camera  Mic Screen Chat Parts End               │ │
                    │      └──────────────────────────────────────────────────┘ │
                    │                                                            │
                    ▼                                                            ▼
            [Share Meeting ID]                              [Control Buttons]
            (Copy to clipboard)                               (Toggle states)
                    │                                          │
                    ▼                                          ▼
            "Send to students"               ┌────────────────┴────────────────┐
                    │                        │                │                │
                    ▼                        ▼                ▼                ▼
                               [Camera Off]  [Mic On]   [Share Screen]
                               (Red bg)      (Green)    (Screen Modal)
                                                              │
                                                              ▼
                                                        ┌──────────────┐
                                                        │ Screen Share │
                                                        │ Video Stream │
                                                        │ [Stop Btn]   │
                                                        └──────────────┘
```

## Component Structure

```
teacher.html
├── Course Form Section
│   ├── Course Details (code, name, schedule, etc.)
│   ├── Session Settings (date, time)
│   └── Video Class Controls
│       ├── Generate Meeting Link
│       └── Start Video Class
│
└── Video Call Modal (hidden by default)
    ├── Header
    │   ├── Meeting Title
    │   ├── Meeting ID
    │   └── Close Button
    │
    ├── Video Grid Container
    │   ├── Teacher Video Tile
    │   │   ├── Video Element
    │   │   ├── Label
    │   │   └── Status Indicator
    │   │
    │   └── Screen Share Container (hidden)
    │       ├── Screen Video
    │       └── Stop Sharing Button
    │
    └── Control Bar
        ├── Camera Button (Toggle)
        ├── Microphone Button (Toggle)
        ├── Screen Share Button (Toggle)
        ├── Chat Button
        ├── Participants Button
        └── End Call Button
```

## State Management

```javascript
videoCallState = {
  meetingId: "APKL-XXXXXXXXX-XXXXXXXXXXXXX",  // Unique per session
  cameraEnabled: true/false,                   // Camera on/off
  microphoneEnabled: true/false,              // Audio on/off
  screenSharing: false/true,                  // Screen share active
  localStream: MediaStream,                   // Camera + mic stream
  screenStream: MediaStream,                  // Screen share stream
  peers: [],                                  // Connected participants
  isActive: true/false                        // Call active status
}
```

## Event Flow

1. **Generate Meeting Link**
   ```
   Click Button → generateMeetingId() → Display ID → Store in State
   ```

2. **Start Video Call**
   ```
   Click Button → Request Permissions → getUserMedia()
   → Create MediaStream → Show Modal → Attach to Video Element
   ```

3. **Toggle Camera**
   ```
   Click Button → Access VideoTrack → Set enabled property
   → Update UI styling (opacity, background color)
   ```

4. **Toggle Microphone**
   ```
   Click Button → Access AudioTrack → Set enabled property
   → Update UI styling
   ```

5. **Share Screen**
   ```
   Click Button → getDisplayMedia() → Create ScreenStream
   → Show Screen Container → Attach to Video Element
   → Listen for 'ended' event → Auto-stop when user stops sharing
   ```

6. **End Call**
   ```
   Click Button → Confirm Dialog → Stop All Tracks
   → Reset State → Hide Modal → Show Success Message
   ```

## CSS Classes Hierarchy

```
.modal                          // Base modal styling
├── .video-call-container      // Full video interface
│   ├── .video-call-header     // Title bar
│   │   └── .meeting-info      // Course + Meeting ID
│   ├── .video-grid-container  // Main video area
│   │   ├── .videos-grid       // Grid layout
│   │   │   └── .video-tile    // Individual video
│   │   │       └── .teacher-video (special styling)
│   │   │       ├── .video-label
│   │   │       └── .video-controls-overlay
│   │   └── .screen-share-container (hidden by default)
│   │       └── .stop-screen-btn
│   └── .video-controls-bar    // Control buttons
│       ├── .control-btn
│       │   ├── .camera-btn    (green)
│       │   ├── .mic-btn       (green)
│       │   ├── .screen-btn    (blue)
│       │   ├── .chat-btn      (orange)
│       │   ├── .participants-btn (purple)
│       │   └── .end-btn       (red)
│       └── .control-btn.disabled
```

## Browser APIs Used

1. **navigator.mediaDevices.getUserMedia()**
   - Captures camera and microphone input
   - Returns MediaStream object
   - Requires user permission

2. **navigator.mediaDevices.getDisplayMedia()**
   - Captures screen content
   - Returns MediaStream object
   - User selects which screen to share

3. **MediaStream API**
   - Contains audio and video tracks
   - Tracks can be enabled/disabled
   - Can listen for 'ended' events

4. **HTMLVideoElement**
   - Displays video streams
   - `srcObject` property binds MediaStream
   - Autoplay for real-time display

## Responsive Design

```
Desktop (1024px+)
├── Grid: repeat(auto-fit, minmax(350px, 1fr))
├── Multiple videos side-by-side
├── Full controls visible
└── Max height: 900px

Tablet (768px - 1024px)
├── Grid: repeat(auto-fit, minmax(250px, 1fr))
├── Smaller video tiles
├── Compact control buttons
└── Reduced font sizes

Mobile (< 768px)
├── Grid: 1 column (full width)
├── Single video at a time
├── Stacked control buttons
└── Touch-optimized sizes
```

## Future Integration Points

To add multi-user video conferencing, integrate:
- **WebRTC Signaling Server**: For peer discovery
- **STUN/TURN Servers**: For NAT traversal
- **Peer.js or Simple-Peer**: For simplified peer connections
- **Socket.io or WebSocket**: For real-time signaling
- **Recording API**: For session recording
- **Chat Socket**: For text messaging

Example structure:
```
Video Call Modal
├── Local Teacher Stream ✓ (Implemented)
├── Student Video Streams (Needs WebRTC)
├── Screen Share ✓ (Implemented)
├── Chat System (Placeholder)
├── Recording (Future)
└── Analytics (Future)
```
