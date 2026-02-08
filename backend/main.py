import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from conversions import c4_to_wave, xml_to_librosa
from analyze import analyze_audio
from reportandscript import generate_texts
from xml_mark_up import mark_up_xml

app = FastAPI()

INSTRUMENT_MAP = {
    "piano": 0,        
    "violin": 40,     
    "viola": 41,       
    "cello": 42,         
    "contrabass": 43,    
    "trumpet": 56,       
    "trombone": 57,      
    "tuba": 58,         
    "french horn": 60,  
    "saxophone": 65,   
    "clarinet": 71,     
    "flute": 73,        
    "guitar": 24,      
    "electric guitar": 27
}

def get_midi_program(instrument_name):
    key = instrument_name.lower().strip()
    return INSTRUMENT_MAP.get(key, 0)

class AnalyzeRequest(BaseModel):
    song_name: str = Field(alias="Song_name")
    instrument: str = Field(alias="Instrument")
    audio_length: float = Field(alias="Audio_length")
    bpm: int = Field(alias="BPM")
    starting_measure: int = Field(alias="Starting_measure")
    recording_b64: str = Field(alias="Recording")  
    target_xml_str: str = Field(alias="Target_XML") 

# returns a summary, a TTS script, a user spectrogram,
# a target spectrogram and a marked up music XML file
@app.post("/analyze")
async def analyze_endpoint(payload: AnalyzeRequest):
    try:
        # reads the raw data
        audio_raw = base64.b64decode(payload.recording_b64)

        # converting raw C4 to wav
        user_wav = await c4_to_wave(audio_raw)

        # determine instrument ID
        midi_program = get_midi_program(payload.instrument)

        # converting Music XML to spectrogram
        target_audio = await xml_to_wave(
            payload.target_xml_str, 
            payload.bpm, 
            payload.starting_measure, 
            payload.audio_length,
            instrument_id=midi_program
        )

        # receives user_spectrogram, target_spectrogram and errors list
        errors = await analyze_audio(
            payload.song_name, 
            payload.instrument, 
            payload.audio_length, 
            user_wav, 
            target_audio
        )

        # receives summary and tts script
        report, tts = await generate_texts(
            payload.song_name, 
            payload.instrument, 
            payload.audio_length, 
            errors
        )
        
        marked_up_xml = mark_up_xml(
            xml_raw, 
            errors, 
            payload.bpm, 
            payload.starting_measure
        )

        return {
            "report": report,
            "tts_script": tts,
            "user_spectrogram": user_spectrogram.tolist(), 
            "target_spectrogram": target_spectrogram.tolist(),
            "marked_up_xml": marked_up_xml
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")