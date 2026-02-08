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
    Analyze the music performance based on the data below. Write a report to the musician (call them "you").
    Return ONLY the report content. Do not add "Here is the summary".

    STRICT FORMAT:
    [2-3 introductory sentences summarizing the overall performance quality and the instrument played]

    [(all caps) ERROR TYPE]: [Detailed description of where and why this error occurred]
    (Repeat for as many distinct error types as found in the data)

    Data:
    {context}
    """
    
    response = await client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content.strip()

async def generate_coach_script(context, instrument):
    prompt = f"""
    You are a music coach. Write a short script for a text-to-speech engine to read to the student.
    Output ONLY the raw spoken text. Do not include "Here is a script" or quotes.

    Requirements:
    1. Tone: Positive and encouraging, but technically grounded.
    2. Content: Briefly mention the errors found in the data, but focus on SPECIFIC technical advice for the {instrument} (e.g., if Guitar, mention fretting/strumming; if Piano, mention posture/fingering).
    3. Length: 3-4 sentences max.

    Data:
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