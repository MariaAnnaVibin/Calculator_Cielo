from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import librosa
import soundfile as sf
import speech_recognition as sr
from gtts import gTTS
import logging

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "responses"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/upload")
async def upload_file(file: UploadFile):
    try:
        logger.info(f"Received file: {file.filename}")

        # Validate file format
        if not file.filename.endswith(('.mp3', '.wav')):
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload an MP3 or WAV file.")

        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Convert audio to WAV if necessary
        wav_path = file_path
        if file.filename.endswith(".mp3"):
            wav_path = os.path.splitext(file_path)[0] + ".wav"
            try:
                audio, sr_rate = librosa.load(file_path, sr=None)
                sf.write(wav_path, audio, sr_rate)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")

        # Transcribe audio using SpeechRecognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                raise HTTPException(status_code=400, detail="Speech could not be recognized.")
            except sr.RequestError:
                raise HTTPException(status_code=503, detail="Speech recognition service unavailable.")

        logger.info(f"Transcription: {transcription}")

        # Simulate response
        response = {
            "transcription": transcription,
            "response_text": f"Processed: {transcription}"
        }

        return response

    except Exception as e:
        logger.error(f"An error occurred: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")