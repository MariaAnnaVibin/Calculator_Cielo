import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const MicComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState(null); // Changed state for transcription
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Add this line to fix the error

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleRecordingStop = async (recordedBlob) => {
    const audioUrl = URL.createObjectURL(recordedBlob.blob);
    setAudioData({ ...recordedBlob, blobURL: audioUrl });
    setLoading(true);
    setError(null); // Reset any previous error
    await sendAudioToBackend(recordedBlob);
    setLoading(false);
  };

  const sendAudioToBackend = async (recordedBlob) => {
    const formData = new FormData();
    formData.append('file', recordedBlob.blob, 'audio.wav');

    try {
      const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const transcriptionText = response.data.transcription; // Get transcription
      setTranscription(transcriptionText); // Store the transcription text
    } catch (error) {
      console.error('Error uploading audio, please try again later.', error);
      setError('Error uploading audio, please try again later.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#ADD8E6', // Light blue background
        position: 'relative', // To position the symbols
      }}
    >
      <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem' }}>CALCULATOR</h1>

      {/* ReactMic */}
      <ReactMic
        record={isRecording}
        onStop={handleRecordingStop}
        className="sound-wave"
        strokeColor="#000000"
        backgroundColor="#ADD8E6"
      />

      {/* Buttons */}
      <div>
        <button
          onClick={startRecording}
          disabled={isRecording || loading}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '16px',
            margin: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording || loading}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '16px',
            margin: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Stop Recording
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p style={{ color: 'white' }}>Processing audio...</p>}

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show error if it exists */}

      {/* Recorded Audio */}
      {audioData && (
        <audio controls style={{ marginTop: '20px' }}>
          <source src={audioData.blobURL} type="audio/wav" />
        </audio>
      )}

      {/* Transcription */}
      {transcription && (
        <div>
          <h2 style={{ color: 'white' }}>Transcription:</h2>
          <p style={{ color: 'white' }}>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default MicComponent;