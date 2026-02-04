/**
 * WebRTC Class Session Manager
 * Handles video, audio, screen sharing, and peer connections for classes
 * Uses simple-peer for P2P and WebSocket for signaling
 */

class ClassWebRTCSession {
  constructor(config = {}) {
    this.meetingId = config.meetingId || null;
    this.userId = config.userId || null;
    this.isTeacher = config.isTeacher || false;
    this.wsUrl = config.wsUrl || `ws://${window.location.hostname}:${window.location.port || 5002}`;
    
    // Media streams
    this.localStream = null;
    this.screenStream = null;
    this.peers = new Map(); // Store peer connections
    this.remoteStreams = new Map(); // Store remote video elements
    
    // Media constraints
    this.videoEnabled = true;
    this.audioEnabled = true;
    this.screenSharingActive = false;
    
    // WebSocket for signaling
    this.ws = null;
    
    // Callbacks
    this.onRemoteStream = config.onRemoteStream || (() => {});
    this.onPeerConnect = config.onPeerConnect || (() => {});
    this.onPeerDisconnect = config.onPeerDisconnect || (() => {});
    this.onScreenShare = config.onScreenShare || (() => {});
    this.onError = config.onError || (() => {});
  }

  /**
   * Initialize WebRTC session
   */
  async initialize() {
    try {
      console.log('🎥 Initializing WebRTC session...');
      
      // Connect WebSocket for signaling
      this.connectWebSocket();
      
      // Request local camera and microphone
      await this.requestLocalMedia();
      
      console.log('✅ WebRTC session initialized');
      return true;
    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Request local camera and microphone
   */
  async requestLocalMedia() {
    try {
      const constraints = {
        video: this.videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: this.audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Local media stream obtained');
      
      // Notify that local stream is ready
      this.onRemoteStream({
        type: 'local',
        stream: this.localStream,
        userId: this.userId
      });

      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting local media:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket for signaling
   */
  connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        
        // Send join message
        this.ws.send(JSON.stringify({
          type: 'join_class',
          meetingId: this.meetingId,
          userId: this.userId,
          isTeacher: this.isTeacher
        }));
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.onError(error);
      };

      this.ws.onclose = () => {
        console.log('⚠️  WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectWebSocket(), 3000);
      };
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.onError(error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleWebSocketMessage(message) {
    try {
      const { type, data } = message;

      switch (type) {
        case 'participant_joined':
          await this.createPeerConnection(data.userId, true);
          break;

        case 'offer':
          await this.handleOffer(data);
          break;

        case 'answer':
          await this.handleAnswer(data);
          break;

        case 'ice_candidate':
          await this.handleICECandidate(data);
          break;

        case 'screen_share_started':
          this.handleScreenShareStarted(data);
          break;

        case 'screen_share_stopped':
          this.handleScreenShareStopped(data);
          break;

        case 'participant_left':
          this.removePeerConnection(data.userId);
          break;

        default:
          console.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.onError(error);
    }
  }

  /**
   * Create peer connection with another participant
   */
  async createPeerConnection(peerId, initiator = false) {
    try {
      if (this.peers.has(peerId)) {
        console.log('Peer already exists:', peerId);
        return;
      }

      console.log(`🔗 Creating peer connection with ${peerId} (initiator: ${initiator})`);

      // Simple-peer options
      const peerConfig = {
        initiator,
        trickleICE: true,
        streams: this.localStream ? [this.localStream] : [],
        config: {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
          ]
        }
      };

      // For demo, using basic RTCPeerConnection instead of simple-peer to avoid npm dependency
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
        ]
      });

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        console.log('📹 Remote track received:', event.track.kind);
        this.onRemoteStream({
          type: 'remote',
          stream: event.streams[0],
          userId: peerId,
          track: event.track
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.ws.send(JSON.stringify({
            type: 'ice_candidate',
            data: {
              to: peerId,
              candidate: event.candidate
            }
          }));
        }
      };

      // Create and send offer if initiator
      if (initiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        this.ws.send(JSON.stringify({
          type: 'offer',
          data: {
            to: peerId,
            offer: offer
          }
        }));
      }

      this.peers.set(peerId, peerConnection);
      console.log(`✅ Peer connection created with ${peerId}`);
      this.onPeerConnect({ userId: peerId });
    } catch (error) {
      console.error('Error creating peer connection:', error);
      this.onError(error);
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(data) {
    try {
      const { from, offer } = data;

      if (!this.peers.has(from)) {
        await this.createPeerConnection(from, false);
      }

      const peerConnection = this.peers.get(from);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.ws.send(JSON.stringify({
        type: 'answer',
        data: {
          to: from,
          answer: answer
        }
      }));

      console.log(`✅ Offer handled and answer sent to ${from}`);
    } catch (error) {
      console.error('Error handling offer:', error);
      this.onError(error);
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(data) {
    try {
      const { from, answer } = data;
      const peerConnection = this.peers.get(from);

      if (!peerConnection) {
        console.error('No peer connection for:', from);
        return;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`✅ Answer received and set for ${from}`);
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError(error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleICECandidate(data) {
    try {
      const { from, candidate } = data;
      const peerConnection = this.peers.get(from);

      if (!peerConnection) {
        console.error('No peer connection for:', from);
        return;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Start screen sharing (teacher only)
   */
  async startScreenShare() {
    try {
      if (!this.isTeacher) {
        throw new Error('Only teachers can share screen');
      }

      if (this.screenSharingActive) {
        console.log('⚠️  Screen sharing already active');
        return;
      }

      console.log('📺 Starting screen share...');

      // Request screen capture
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      const screenTrack = this.screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      for (const [peerId, peerConnection] of this.peers) {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      }

      this.screenSharingActive = true;

      // Handle screen share stop
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      // Notify via WebSocket
      this.ws.send(JSON.stringify({
        type: 'screen_share_started',
        data: { meetingId: this.meetingId, userId: this.userId }
      }));

      this.onScreenShare({ active: true, userId: this.userId });
      console.log('✅ Screen sharing started');

      return true;
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare() {
    try {
      if (!this.screenSharingActive) return;

      console.log('🛑 Stopping screen share...');

      // Stop screen stream tracks
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
      }

      // Switch back to camera track
      const videoTrack = this.localStream.getVideoTracks()[0];
      for (const [peerId, peerConnection] of this.peers) {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      this.screenSharingActive = false;

      // Notify via WebSocket
      this.ws.send(JSON.stringify({
        type: 'screen_share_stopped',
        data: { meetingId: this.meetingId, userId: this.userId }
      }));

      this.onScreenShare({ active: false, userId: this.userId });
      console.log('✅ Screen sharing stopped');

      return true;
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Handle incoming screen share start
   */
  handleScreenShareStarted(data) {
    console.log('📺 Screen share started by:', data.userId);
    this.onScreenShare({ active: true, userId: data.userId });
  }

  /**
   * Handle incoming screen share stop
   */
  handleScreenShareStopped(data) {
    console.log('🛑 Screen share stopped by:', data.userId);
    this.onScreenShare({ active: false, userId: data.userId });
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    try {
      if (!this.localStream) return false;

      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });

      this.videoEnabled = enabled;
      console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Error toggling video:', error);
      return false;
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    try {
      if (!this.localStream) return false;

      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });

      this.audioEnabled = enabled;
      console.log(`🎤 Audio ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  }

  /**
   * Remove peer connection
   */
  removePeerConnection(peerId) {
    try {
      const peerConnection = this.peers.get(peerId);
      if (peerConnection) {
        peerConnection.close();
        this.peers.delete(peerId);
        this.remoteStreams.delete(peerId);
        console.log(`✅ Peer connection closed: ${peerId}`);
        this.onPeerDisconnect({ userId: peerId });
      }
    } catch (error) {
      console.error('Error removing peer connection:', error);
    }
  }

  /**
   * End session and cleanup
   */
  endSession() {
    try {
      console.log('🏁 Ending WebRTC session...');

      // Close all peer connections
      for (const [peerId, peerConnection] of this.peers) {
        peerConnection.close();
      }
      this.peers.clear();

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }

      // Stop screen stream
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
      }

      // Close WebSocket
      if (this.ws) {
        this.ws.close();
      }

      console.log('✅ WebRTC session ended');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassWebRTCSession;
}
