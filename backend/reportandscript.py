import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

def format_context(song_name, instrument, audio_length, errors):
    """
    Turns the raw list data into a readable string for the LLM.
    errors input format: [[type, time, desc], [type, time, desc], ...]
    """
    error_str = ""
    if not errors:
        error_str = "No specific errors detected. The performance was accurate."
    else:
        for e in errors:
            # e[0] = type, e[1] = time, e[2] = description
            error_str += f"- At {e[1]}s: [{e[0]}] {e[2]}\n"

    context = (
        f"Song: {song_name}\n"
        f"Instrument: {instrument}\n"
        f"Total Duration: {audio_length} seconds\n\n"
        f"Detected Issues:\n{error_str}"
    )
    return context

async def generate_summary(context):
    prompt = f"""
    Analyze the music performance based on the data below and write a review addressed to the musician (use "you").
    Return ONLY the review content in MARKDOWN format. Do not include meta-comments.

    Guidelines:
    1. Start with 2-3 sentences summarizing overall performance, strengths, and instrument played.
    2. For each distinct error type, create a section with:
    - A bolded error type
    - Description of where and why it occurred
    - A bulleted list of actionable improvement steps
    3. However don't feel the need to cover every single error if there are many. Focus on the most impactful ones to avoid overwhelming the student.
    4. Keep the tone supportive, encouraging, and professional.

    Performance Data:
    {context}
    """
    
    response = await client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content.strip()

async def generate_coach_script(context, instrument):
    prompt = f"""
    You are a warm, encouraging music coach speaking directly to a student. 
    Write a short, friendly script for a text-to-speech engine to read aloud. 
    Output ONLY the spoken text, without quotes or any meta-commentary.

    Guidelines:
    1. Tone: Supportive, upbeat, and motivating, but still provide precise, practical advice.
    2. Content: Gently mention the errors from the data, then focus on actionable tips tailored to the {instrument} (e.g., for Guitar: fretting, strumming; for Piano: fingering, posture).
    3. Length: Keep it concise—5 to 6 sentences maximum.
    4. Highlight 2-3 key improvement tips that the student can focus on in their next practice session. Bring up specific examples from their playing to make it feel personalized and relevant.
    4. Style: Imagine you are speaking directly to the student, helping them improve without discouraging them.

    Observed performance:
    {context}
    """
    
    response = await client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()

async def generate_texts(song_name, instrument, audio_length, errors):
    """
    Orchestrates the LLM calls and returns the report and script.
    """
    # format the data for the AI
    context = format_context(song_name, instrument, audio_length, errors)
    
    # run both prompts at the same time (faster)
    summary_task = generate_summary(context)
    script_task = generate_coach_script(context, instrument)
    
    # wait for both to finish
    summary, script = await asyncio.gather(summary_task, script_task)
    
    return summary, script