import io
import os
import requests
import numpy as np
import music21
import pretty_midi
from scipy.io.wavfile import write as wav_write
import asyncio

# converts c4 files to wav
def c4_to_wave(c4_data):
    state = None
    pcm_data, state = audioop.adpcm2lin(c4_data, 2, state)

    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wav_file:
        wav_file.setnchannels(1)  
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100) 
        wav_file.writeframes(pcm_data)

    wav_io.seek(0)
    return wav_io.read()

# converts music xml to wav
async def xml_to_wave(xml_content, bpm, starting_measure, audio_length, instrument_id=0, sr=44100):
    sf2_path = "default_soundfont.sf3"
    
    if not os.path.exists(sf2_path):
        url = "https://github.com/musescore/MuseScore/raw/master/share/sound/FluidR3Mono_GM.sf3"
        response = requests.get(url)
        with open(sf2_path, "wb") as f:
            f.write(response.content)

    temp_midi = "temp_conversion.mid"

    try:
        # parse
        score = music21.converter.parse(xml_content, format='musicxml')

        # force bpm
        for el in score.recurse().getElementsByClass(music21.tempo.MetronomeMark):
            el.activeSite.remove(el)
        score.insert(0, music21.tempo.MetronomeMark(number=bpm))

        # slice by starting measure
        if starting_measure > 1:
            score = score.measures(starting_measure, None)
        score.write('midi', fp=temp_midi)

        # synthesize
        pm = pretty_midi.PrettyMIDI(temp_midi)
        new_pm = pretty_midi.PrettyMIDI()
        target_inst = pretty_midi.Instrument(program=instrument_id)
        
        for instrument in pm.instruments:
            for note in instrument.notes:
                target_inst.notes.append(note)
        
        new_pm.instruments.append(target_inst)
        
        # generate
        try:
            audio_data = new_pm.fluidsynth(fs=sr, sf2_path=sf2_path)
        except ImportError as ie:
            print(f"⚠️  FluidSynth Error: {ie}")
            print("Please ensure you have FluidSynth installed on your system and added to your PATH.")
            # Fallback: Generate silence if synthesis fails, so the app doesn't crash
            audio_data = np.zeros(int(audio_length * sr))
        except Exception as e:
            print(f"⚠️  Synthesis Error: {e}")
            audio_data = np.zeros(int(audio_length * sr))
        
        # trim
        target_samples = int(audio_length * sr)
        
        if len(audio_data) > target_samples:
            audio_data = audio_data[:target_samples]
        elif len(audio_data) < target_samples:
            padding = np.zeros(target_samples - len(audio_data))
            audio_data = np.concatenate((audio_data, padding))
        
        # clean midi file
        if os.path.exists(temp_midi):
            os.remove(temp_midi)

        # encode to wav
        audio_int16 = (audio_data * 32767).astype(np.int16)
        
        wav_buffer = io.BytesIO()
        wav_write(wav_buffer, sr, audio_int16)
        wav_buffer.seek(0) 
        
        return wav_buffer

    except Exception as e:
        if os.path.exists(temp_midi):
            os.remove(temp_midi)
        raise RuntimeError(f"Failed to process audio: {e}")

if __name__ == "__main__":

    filename = "ode-to-joy.xml"
    
    with open(filename, "r") as f:
        xml_content = f.read()

    print(f"Processing {filename}...")

    wav_io = asyncio.run(xml_to_wave(
        xml_content=xml_content, 
        bpm=120, 
        starting_measure=1, 
        audio_length=10 
    ))

    with open("output.wav", "wb") as f:
        f.write(wav_io.read())

    print("Success! Audio saved to output.wav")