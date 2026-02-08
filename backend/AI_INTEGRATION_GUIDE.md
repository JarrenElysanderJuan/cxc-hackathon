# AI Analysis Integration Guide

This guide is for the teammates working on the AI model. It explains how to integrate your AI analysis logic into the **Harmony Helper** backend and ensures your results are automatically saved to our data persistence layer (Supabase).

## 1. The Handoff Flow

The application follows a two-step process to ensure data integrity:

1.  **Analyze (The AI Step)**: The frontend sends the recording and sheet music to your `/api/analyze` endpoint. Your model processes it and returns the coach's feedback.
2.  **Save (The Persistence Step)**: After the user reviews the feedback, the frontend calls `/api/sessions`. This endpoint automatically takes **your AI output** and saves it into the `sessions` table in Supabase.

> [!IMPORTANT]
> You do **not** need to write any Supabase/Database code. As long as your endpoint returns the correct JSON structure, my persistence logic will handle the rest!

---

## 2. Input Specification (`/api/analyze`)

Your endpoint will receive a **POST** request with the following payload (`AnalyzePayload`):

| Field | Type | Description |
| :--- | :--- | :--- |
| `Song_name` | `string` | The name of the song being practiced. |
| `Instrument` | `string` | The instrument selected (e.g., "Piano", "Voice"). |
| `Audio_length` | `float` | Duration of the recording in seconds. |
| `Recording` | `string` | **Base64 encoded** audio data (WebM/AAC format). |
| `Target_XML` | `string` | The MusicXML content of the sheet music practiced. |
| `BPM` | `int` | The tempo set during the session. |
| `Start_Measure`| `int` | The measure number where the user started playing. |

---

## 3. Output Specification (Response)

For the frontend to display your feedback and the backend to save it, you **must** return a JSON object with at least these two fields:

```json
{
    "performace_summary": "A high-level summary of how the user played (e.g., 'Great rhythm!').",
    "coach-feedback": "Specific, actionable advice (e.g., 'Watch your dynamics in measure 4.').",
    "user-spectrogram": "Optional: Base64 string of a generated spectrogram image.",
    "target-spectrogram": "Optional: Base64 string of a reference spectrogram image.",
    "marked-up-musicxml": "Optional: Modified MusicXML if you want to highlight errors."
}
```

---

## 4. Where to Implement Your Logic

Inside `backend/main.py`, find the `@app.post("/api/analyze")` function. 

Currently, it looks like this:

```python
@app.post("/api/analyze")
async def analyze(payload: AnalyzePayload):
    # TODO: Replace the mock response below with your AI model logic
    return {
        "performace_summary": f"Great session with {payload.Song_name}!",
        "coach-feedback": "Try focusing on the transition at measure 4.",
        # ...
    }
```

### Tips for Implementation:
- **Base64 Decoding**: You can use `base64.b64decode(payload.Recording)` to get the raw bytes of the audio.
- **MusicXML Parsing**: The `Target_XML` is provided as a raw string.
- **Environment**: If your model requires specific libraries (like `librosa` or `numpy`), add them to `backend/requirements.txt`.

---

## 5. Verification

To verify that your integration is working:
1.  Run the backend: `python main.py`.
2.  Perform a recording in the frontend.
3.  Click **"AI Feedback"**.
4.  If your feedback appears on the feedback screen, and then appears in the **"Previous Sessions"** history page after saving, the integration is successful!
