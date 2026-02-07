import os
import json
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

def parse_input(json_data):
    errors = []
    metadata = {"instrument": json_data.get("instrument"), "time": json_data.get("time")}
    
    for key, value in json_data.items():
        if key.startswith("error"):
            errors.append(value)
            
    return json.dumps({"metadata": metadata, "errors": errors}, indent=2)

async def generate_summary(context):
    prompt = f"""
    Analyze the music performance as if you are writing a report to the musician (call him "you"). 
    Return ONLY the report content. Do not add "Here is the summary" or markdown code blocks.

    STRICT FORMAT:
    [2-3 introductory sentences summarizing the overall performance quality and the instrument played]

    [(all caps) ERROR TYPE 1]: [Detailed description of where and why this error occurred]
    [(all caps) ERROR TYPE 2]: [Detailed description of where and why this error occurred]
    (Repeat for as many distinct error types as found in the data)

    Data: {context}
    """
    
    response = await client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content.strip()

async def generate_coach_script(context):
    prompt = f"""
    You are a music coach. Write a script for a text-to-speech engine. 
    Output ONLY the raw spoken text. Do not include "Here is a script" or quotes.

    Requirements:
    1. Tone: Positive and encouraging, but technically grounded.
    2. Content: Acknowledge the errors vaguely, but provide SPECIFIC technical advice for the instrument mentioned in the metadata (e.g., if Guitar, mention fretting/strumming; if Piano, mention posture/fingering).
    3. Length: 3-4 sentences.

    Data: {context}
    """
    
    response = await client.chat.completions.create(
        model="meta-llama/llama-3.2-3b-instruct",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()

async def process_performance(json_input):
    data = parse_input(json_input)
    
    summary_task = generate_summary(data)
    script_task = generate_coach_script(data)
    
    summary, script = await asyncio.gather(summary_task, script_task)
    
    return {
        "text_summary": summary,
        "tts_script": script
    }

if __name__ == "__main__":
    raw_data = {
        "instrument": "Guitar",
        "time": "10s",
        "error1": {"type": "pitch", "desc": "Pitch too high at 0:02s"},
        "error2": {"type": "tempo", "desc": "Missed a note at 00:05"},
        "error3": {"type": "pitch", "desc": "Pitch too high at 00:08"}
    }
    
    results = asyncio.run(process_performance(raw_data))
    
    print("SUMMARY")
    print(results["text_summary"])
    print("\nTTS SCRIPT")
    print(results["tts_script"])