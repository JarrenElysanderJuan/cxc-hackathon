import os
import requests
import music21
import pretty_midi
import numpy as np
import librosa

# converts c4 files to librosa
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

async def xml_to_librosa(xml_content, bpm, starting_measure, audio_length, instrument_id=71, sr=44100):
    sf2_path = "default_soundfont.sf3"
    
    if not os.path.exists(sf2_path):
        url = "https://github.com/musescore/MuseScore/raw/master/share/sound/FluidR3Mono_GM.sf3"
        response = requests.get(url)
        with open(sf2_path, "wb") as f:
            f.write(response.content)

    temp_midi = "temp_conversion.mid"

    try:
        score = music21.converter.parse(xml_content, format='musicxml')

        # force bpm
        for el in score.recurse().getElementsByClass(music21.tempo.MetronomeMark):
            el.activeSite.remove(el)
        score.insert(0, music21.tempo.MetronomeMark(number=bpm))

        # slice by starting measure
        if starting_measure > 1:
            score = score.measures(starting_measure, None)
        score.write('midi', fp=temp_midi)

    except Exception as e:
        raise RuntimeError(f"Failed to parse XML content: {e}")

    try:
        pm = pretty_midi.PrettyMIDI(temp_midi)
        new_pm = pretty_midi.PrettyMIDI()
        target_inst = pretty_midi.Instrument(program=instrument_id)
        
        for instrument in pm.instruments:
            for note in instrument.notes:
                target_inst.notes.append(note)
        
        new_pm.instruments.append(target_inst)
        
        audio_data = new_pm.fluidsynth(fs=sr, sf2_path=sf2_path)
        
        # trim to audio length
        target_samples = int(audio_length * sr)
        
        if len(audio_data) > target_samples:
            audio_data = audio_data[:target_samples]
        elif len(audio_data) < target_samples:
            padding = np.zeros(target_samples - len(audio_data))
            audio_data = np.concatenate((audio_data, padding))
        
        if os.path.exists(temp_midi):
            os.remove(temp_midi)

        # make spectrogram
        hop_length = 512
        D = np.abs(librosa.stft(audio_data, hop_length=hop_length))
        DB = librosa.amplitude_to_db(D, ref=np.max)
        
        min_db, max_db = DB.min(), DB.max()
        if max_db - min_db != 0:
            DB = (DB - min_db) / (max_db - min_db)
        else:
            DB = np.zeros_like(DB)
        
        spectrogram_data = []
        freqs = librosa.fft_frequencies(sr=sr)
        times = librosa.frames_to_time(np.arange(DB.shape[1]), sr=sr, hop_length=hop_length)
        
        threshold = 0.4 
        freq_step = 4 
        
        for t_idx, t_val in enumerate(times):
            for f_idx in range(0, len(freqs), freq_step):
                amp = DB[f_idx, t_idx]
                if amp > threshold:
                    spectrogram_data.append([float(t_val), float(freqs[f_idx]), float(amp)])

        return spectrogram_data

    except Exception as e:
        if os.path.exists(temp_midi):
            os.remove(temp_midi)
        raise RuntimeError(f"Failed to synthesize MIDI: {e}")