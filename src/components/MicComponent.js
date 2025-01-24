import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const MicComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState(null); // Changed state for transcription
  const [loading, setLoading] = useState(false);

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
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <div>

      <h1>Calculator</h1>

      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={handleRecordingStop}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />

      <div>
        <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
        <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      </div>

      {audioData && (
        <audio controls>
          <source src={audioData.blobURL} type="audio/wav" />
        </audio>
      )}

      {loading && <p>Processing audio...</p>}

      {/* Display the transcription text instead of audio */}
      {transcription && (
        <div>
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}

    </div>
  );
};

export default MicComponent;
