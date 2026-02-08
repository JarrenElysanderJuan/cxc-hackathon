import numpy as np

async def analyze_audio(song_name: str, instrument: str, audio_length: float, user_wav: bytes, target_wav: bytes):
    """
    BLACK BOX STUB: This function will be implemented by the partner.
    It currently returns mock error data and spectrograms.
    """
    print(f"🔬 [Analyze] Processing {song_name} ({instrument}) - {audio_length}s")
    
    # Mocking a few errors for testing the pipeline
    errors = [
        ["pitch", 2.0, "Slightly sharp on the high note"],
        ["pitch", 8.0, "Missed the intended note on the third measure"],
        ["rhythm", 5.5, "A bit behind the beat here"],
        ["rhythm", 12.0, "Rushed through a transition between measures"],
        ["dynamics", 3.0, "Volume was too soft on the melody line"],
        ["dynamics", 15.0, "Accent on the downbeat was missed"],
        ["articulation", 7.0, "Legato phrasing wasn’t smooth between these notes"],
        ["articulation", 10.0, "Staccato notes were held slightly too long"],
        ["technique", 4.5, "Finger placement caused a muffled chord sound"],
        ["technique", 9.0, "Strumming hand wasn’t consistent on these chords"],
        ["posture", 1.0, "Shoulders were tense, affecting overall tone"],
        ["posture", 6.0, "Hand position on keys could be more relaxed"],
    ]
        
    # Mocking base64 spectrograms for the frontend
    # In a real app, these would be Mel-spectrogram images
    user_spectrogram = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" # Red dot
    target_spectrogram = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" # Green dot
    
    return {
        "errors": errors,
        "user_spectrogram": user_spectrogram,
        "target_spectrogram": target_spectrogram
    }
