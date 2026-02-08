# AI Analysis Contract: `analyze_audio`

This document defines the interface for the `analyze_audio` function, which is the core inference engine of the Harmony Helper AI.

## Function Signature

```python
async def analyze_audio(
    song_name: str, 
    instrument: str, 
    audio_length: float, 
    user_wav: bytes, 
    target_wav: bytes
) -> dict:
```

### Input Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `song_name` | `str` | The title of the piece (e.g., "Ode to Joy"). |
| `instrument` | `str` | The instrument being played (e.g., "Piano", "Violin"). |
| `audio_length` | `float` | Exact duration of the performance in seconds. |
| `user_wav` | `bytes` | Raw WAV data of the user's recorded performance (44.1kHz, Mono). |
| `target_wav` | `bytes` | Raw WAV data synthesized from the MusicXML (used as the ground truth). |

---

## Expected Return Format

The function must return a dictionary containing the detected errors and the visual spectrogram data.

```json
{
    "errors": [
        ["pitch", 1.25, "Note was slightly flat (A# instead of B)"],
        ["rhythm", 4.5, "Significant rushing on the eighth note passage"],
        ["dynamics", 12.0, "Played mezzoforte where piano was marked"]
    ],
    "user_spectrogram": [[float, ...], [float, ...]],
    "target_spectrogram": [[float, ...], [float, ...]]
}
```

### Return Field Details

#### 1. `errors` (List of Lists)
- **Error Type**: String (`"pitch"`, `"rhythm"`, or `"dynamics"`). This matches the categories used for filtering in the UI.
- **Timestamp**: Float (seconds from start). This is used by `xml_mark_up.py` to highlight specific notes in red.
- **Description**: String. A short, technical explanation sent to the LLM to generate the final report.

#### 2. `user_spectrogram` & `target_spectrogram` (2D Arrays)
- These should be standard Mel-spectrograms (usually 128 bins) represented as 2D lists of floats.
- These will be visualized in the frontend for side-by-side comparison.

---

## Downstream Usage

1. **`reportandscript.py`**: Uses the `errors` list to summarize the session and write a coach script.
2. **`xml_mark_up.py`**: Uses the `timestamp` to match errors to the closest note in the MusicXML and color it red.
3. **Frontend**: Uses the `user_spectrogram` and `target_spectrogram` values to render the visual "voiceprint" of the session.
