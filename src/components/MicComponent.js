import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const MicComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [responseAudio, setResponseAudio] = useState(null);
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

      setResponseAudio(response.data.audio_url);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <div>
      <h1>Speech to Text, Process, and Convert to Speech</h1>
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
      {responseAudio && (
        <audio controls>
          <source src={responseAudio} type="audio/wav" />
        </audio>
      )}
    </div>
  );
};

export default MicComponent;
