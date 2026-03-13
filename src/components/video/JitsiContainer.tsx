// src/components/Video/JitsiContainer.tsx
import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface JitsiProps {
  roomName: string;
  displayName: string;
  onLeave: () => void;
}

const JitsiContainer: React.FC<JitsiProps> = ({ roomName, displayName, onLeave }) => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: true,
          enableEmailInStats: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{ displayName, email: "" }}
        onReadyToClose={onLeave}
        getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
      />
    </div>
  );
};

export default JitsiContainer;