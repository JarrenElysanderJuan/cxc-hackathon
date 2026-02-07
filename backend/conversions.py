import os
import requests
import music21
import pretty_midi
import numpy as np
import librosa

def xml_to_librosa(xml_file_path, instrument_id=71, sr=44100):
    sf2_path = "default_soundfont.sf3"
    
    if not os.path.exists(sf2_path):
        url = "https://github.com/musescore/MuseScore/raw/master/share/sound/FluidR3Mono_GM.sf3"
        response = requests.get(url)
        with open(sf2_path, "wb") as f:
            f.write(response.content)

    try:
        score = music21.converter.parse(xml_file_path)
        temp_midi = "temp_conversion.mid"
        score.write('midi', fp=temp_midi)
    except Exception as e:
        raise RuntimeError(f"Failed to parse XML: {e}")

    try:
        pm = pretty_midi.PrettyMIDI(temp_midi)
        new_pm = pretty_midi.PrettyMIDI()
        target_inst = pretty_midi.Instrument(program=instrument_id)
        
        for instrument in pm.instruments:
            for note in instrument.notes:
                target_inst.notes.append(note)
        
        new_pm.instruments.append(target_inst)
        audio_data = new_pm.fluidsynth(fs=sr, sf2_path=sf2_path)
        
        if os.path.exists(temp_midi):
            os.remove(temp_midi)

        hop_length = 512
        D = np.abs(librosa.stft(audio_data, hop_length=hop_length))
        DB = librosa.amplitude_to_db(D, ref=np.max)
        
        DB = (DB - DB.min()) / (DB.max() - DB.min())
        
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

        return audio_data, sr, spectrogram_data

    except Exception as e:
        if os.path.exists(temp_midi):
            os.remove(temp_midi)
        raise RuntimeError(f"Failed to synthesize MIDI: {e}")