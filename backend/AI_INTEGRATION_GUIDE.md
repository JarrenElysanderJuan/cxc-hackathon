# AI Analysis Integration Guide

This guide is for the teammates working on the AI model. It explains how to integrate your AI analysis logic into the **Harmony Helper** backend and ensures your results are automatically saved to our data persistence layer (Supabase).

## 1. The Handoff Flow

The application follows a two-step process to ensure data integrity:

1.  **Analyze (The AI Step)**: The frontend sends the recording and sheet music to the `/api/analyze` endpoint. The server handles audio conversion and synthesizes reference audio before calling your inference logic.
2.  **Save (The Persistence Step)**: After the user reviews the feedback, the frontend calls `/api/sessions`. This endpoint automatically takes **your AI output** and saves it into the `sessions` table in Supabase.

> [!IMPORTANT]
> You do **not** need to write any Supabase/Database code. As long as your endpoint returns the correct JSON structure, my persistence logic will handle the rest!

---

## 2. Input Specification (`analyze_audio` function)

Instead of editing `main.py` directly, you should implement your logic in `backend/analyze.py`. This function is called by the main server.

```python
async def analyze_audio(
    song_name: str, 
    instrument: str, 
    audio_length: float, 
    user_wav: bytes, 
    target_wav: bytes
) -> dict:
```

### Parameters:
- `user_wav`: Raw bytes of the user's performance (PCM WAV).
- `target_wav`: Raw bytes of the synthesized reference (PCM WAV).
- `audio_length`: Total duration in seconds.

---

## 3. Output Specification (Response)

For the frontend to display your feedback, you **must** return a dictionary with these fields:

```python
{
    "errors": [
        ["pitch", 1.5, "Slightly sharp on the F#"],
        ["rhythm", 4.0, "Dragged the quarter note"]
    ],
    "user_spectrogram": "data:image/png;base64,...",
    "target_spectrogram": "data:image/png;base64,..."
}
```

### Return Data Details:
- **`errors`**: A list of `[type, timestamp, description]`. 
    - `type`: "pitch", "rhythm", or "dynamics".
    - `timestamp`: Seconds from the start of the recording.
- **Spectrograms**: Base64 data URIs of the Mel-spectrogram images.

---

## 4. Helper Modules Provided

I have integrated the following modules from your team to help with the pipeline:
- **`conversions.py`**: Handles MusicXML to MIDI to WAV synthesis.
- **`reportandscript.py`**: Automatically generates LLM summaries and coach scripts from your `errors` list.
- **`xml_mark_up.py`**: Colors notes red in the MusicXML based on your `errors` list.

---

## 5. Verification

To verify that your integration is working:
1.  Open `backend/analyze.py`.
2.  Drop your inference logic into the `analyze_audio` function.
3.  Run the backend: `python main.py`.
4.  Perform a recording in the frontend and click **"AI Feedback"**.
5.  If the sheet music shows red notes and the avatar speaks your feedback, the integration is successful!
