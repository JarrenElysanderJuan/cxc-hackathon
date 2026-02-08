import librosa
import matplotlib.pyplot as plt
import numpy as np
import io

def extract_features(file_path):
    # load the file
    y, sr = librosa.load(file_path, sr=22050)
#     y = file_path
#     sr = 22050
#    y, sr = librosa.load(file_path)

    # find the fundamental frequencies
    f0, voiced_flag, voiced_probs = librosa.pyin(y,
                                                 sr=sr,
                                                 fmin=librosa.note_to_hz('C2'),
                                                 fmax=librosa.note_to_hz('C7'))

    # get the time values of f0
    times = librosa.times_like(f0, sr=sr)

    # get onset times
    S_onset = librosa.amplitude_to_db(np.abs(librosa.feature.melspectrogram(y=y)), ref=np.max)
    S_onset[0:10, :] = np.min(S_onset)
    o_env = librosa.onset.onset_strength(S=S_onset, sr=sr, lag=1, max_size=5, aggregate=np.max)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, onset_envelope=o_env)
    
#     fig, ax = plt.subplots()
#     img = librosa.display.specshow(S_onset, x_axis='time', y_axis='fft_note', ax=ax)
#     fig.colorbar(img, ax=ax, format="%+2.f dB")
#     plt.show()

    # compute a spectrogram
    D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)

    # quantize f0 to notes and remove insignificant ones
    f0_note = np.ndarray(f0.shape)
    for i in range(f0.shape[0]):
        hz = f0[i]
        note_hz = float('nan')
        voiced_prob = voiced_probs[i]

        if voiced_prob > 0.5:
            try:
                note_hz = librosa.note_to_hz(librosa.hz_to_note(hz))
            except:
                pass
        
        f0_note[i] = note_hz
        
    def roll_onset_frames(f0, frame):
        max = f0.shape[0] - 1
        for i in reversed(range(6)):
            if not np.isnan(f0[min(max, frame + i)]):
                return f0[min(max, frame + i)]
        
        return np.nan

    # remove insignificant onsets
    onset_frames_lst = []
    for i in range(onset_frames.shape[0]):
        if not np.isnan(roll_onset_frames(f0_note, onset_frames[i])):
            onset_frames_lst.append(onset_frames[i])

    clean_onset_frames = np.asarray(onset_frames_lst)

    # get list of notes and time of each onset
    onset_pitches = np.ndarray((clean_onset_frames.shape[0], 2))
    for i in range(clean_onset_frames.shape[0]):
        frame = clean_onset_frames[i]
#        time = times[frame]
        note = f0_note[frame]
        try:
            temp_note = roll_onset_frames(f0_note, frame)
            if not np.isnan(temp_note):
                note = temp_note
        except:
            pass
        onset_pitches[i, 0] = frame
        onset_pitches[i, 1] = note

    # plot the graph
    def plot_graph():
        fig, ax = plt.subplots()
        img = librosa.display.specshow(D, x_axis='time', y_axis='fft_note', ax=ax)
        fig.colorbar(img, ax=ax, format="%+2.f dB")

        ax.set(title='pYIN fundamental frequency estimation')
        ax.vlines(times[clean_onset_frames], 0, librosa.note_to_hz('C7'), color='r', linestyle='--',
                  label='Onsets')

        ax.plot(times, f0_note, label='f0', color='cyan', linewidth=3)

        ax.plot(times[onset_pitches[:,0].astype(np.int64)], onset_pitches[:,1], label='onset notes', color='green',
                linestyle='', markersize=10, marker='+')

        ax.legend(loc='upper right')
        ax.set_ylim(librosa.note_to_hz('C1'), librosa.note_to_hz('C7'))
        plt.show()
    
    plot_graph()
    
    return f0_note, onset_pitches, times

def find_errors(path_perfect, path_played):
    f0_perf, onsets_perf, times = extract_features(path_perfect)
    f0_play, onsets_play, _ = extract_features(path_played)
    onsets_perf_arr = np.full(f0_perf.shape, np.nan)
    onsets_play_arr = np.full(f0_play.shape, np.nan)
    onsets_perf_arr[onsets_perf[:, 0].astype(np.int64)] = onsets_perf[:, 1]
    onsets_play_arr[onsets_play[:, 0].astype(np.int64)] = onsets_play[:, 1]
        

    for i in range(f0_play.shape[0]):
        if not np.isnan(f0_play[i]):
            index = max(0, i)
            shape = f0_play.shape[0]
            f0_play = f0_play[index:shape]
            onsets_play_arr = onsets_play_arr[index:shape]
            break

    for i in reversed(range(f0_play.shape[0])):
        if not np.isnan(f0_play[i]):
            index = min(f0_play.shape[0], i)
            f0_play = f0_play[0:index]
            onsets_play_arr = onsets_play_arr[0:index]
            break
    
    # Removes nan and converts to midi
#    f0_perf[np.isnan(f0_perf)] = 1
    f0_perf = librosa.hz_to_midi(f0_perf)
#    f0_play[np.isnan(f0_play)] = 1
    f0_play = librosa.hz_to_midi(f0_play)
    
    X = f0_perf.copy()
    Y = f0_play.copy()

    def nan_helper(y):
        return np.isnan(y), lambda z: z.nonzero()[0]
    
    X_nans, X_f = nan_helper(X)
    X[X_nans] = np.interp(X_f(X_nans), X_f(~X_nans), X[~X_nans])
    Y_nans, Y_f = nan_helper(Y)
    Y[Y_nans] = np.interp(Y_f(Y_nans), Y_f(~Y_nans), Y[~Y_nans])

    D, wp = librosa.sequence.dtw(X[np.newaxis, :],
                                   Y[np.newaxis, :],
                                   subseq=False,
                                   global_constraints=False,
                                   weights_add=np.array([0, -0.1, -0.1]),
                                   weights_mul=np.array([1, 1, 1]))
    wp = np.flip(wp, 0)

    def find_matching_index(wp, frame):
        for i in range(wp.shape[0]):
            if wp[i, 0] == frame:
                return wp[i, 1]
    
    def get_wp_index(wp, frame):
        for i in range(wp.shape[0]):
            if wp[i, 0] == frame:
                return i

    errors = []
    diff = 0
    for frame, note in onsets_perf:
        play_frame = find_matching_index(wp, frame)
        
        wp_i = get_wp_index(wp, frame)
        deviation = diff - (wp[wp_i, 0] - wp[wp_i, 1])
        diff = wp[wp_i, 0] - wp[wp_i, 1]

        found_note = False
        note_frame = None
        distance = 100
        for i in range(max(0, play_frame - 5), min(play_frame + 6,
                                                    onsets_play_arr.shape[0] - 1)):
            if not np.isnan(onsets_play_arr[i]) and np.abs(i - play_frame) < distance:
                found_note = True
                note_frame = i
                distance = np.abs(i - play_frame)
        
        time = times[int(frame)]
        if not found_note:
            print(f"Missed note at {time}")
            errors.append(["missed-note", time, "A note that should have been played was not played."])
        elif librosa.hz_to_note(onsets_play_arr[note_frame]) != librosa.hz_to_note(note):
            if onsets_play_arr[note_frame] > note:
                print(f"Pitch too high at {time}")
                errors.append(["pitch-too-high", time,
                               f"The pitch played is too high. The correct note was {librosa.hz_to_note(note)}, but {librosa.hz_to_note(onsets_play_arr[note_frame])} was played."])
            else:
                print(f"Pitch too low at {time}")
                errors.append(["pitch-too-low", time,
                               f"The pitch played is too low. The correct note was {librosa.hz_to_note(note)}, but {librosa.hz_to_note(onsets_play_arr[note_frame])} was played."])
        
        if found_note:
            if deviation < -20:
                print(f"Note was played too late at {time}")
                errors.append(["note-late", time,
                               f"The note was played too late"])
            if deviation > 20:
                print(f"Note was played too early at {time}")
                errors.append(["note-early", time,
                               f"The note was played too early"])
    
    return errors

#     adj_perf = np.ndarray(wp.shape[0])
#     adj_play = np.ndarray(wp.shape[0])
#     onset_adj_perf = np.ndarray(wp.shape[0])
#     onset_adj_play = np.ndarray(wp.shape[0])
#     times_adj = np.ndarray(wp.shape[0])
#     print(onsets_play_arr.shape)
#     for i in range(wp.shape[0]):
#         adj_perf[i] = f0_perf[wp[i, 0]]
#         adj_play[i] = f0_play[wp[i, 1]]        
#         onset_adj_perf[i] = onsets_perf_arr[wp[i, 0]]        
#         onset_adj_play[i] = onsets_play_arr[wp[i, 1]]        
# 
#         times_adj[i] = times[wp[i, 0]]
#     
#     fig, ax = plt.subplots()
#     ax.plot(times_adj, adj_perf, label='f0', color='cyan', linewidth=1)
# #     ax.plot(_, f0_play, label='f0', color='cyan', linewidth=1)
#     ax.plot(times_adj, adj_play, label='f0', color='red', linewidth=1)
#     ax.plot(times_adj, onset_adj_perf, label='f0', color='cyan', linestyle='',
#             marker='+', markersize=10)
#     ax.plot(times_adj, onset_adj_play, label='f0', color='red', linestyle='',
#             marker='+', markersize=10)
# 
# #     ax.plot(_, onsets_play_arr, label='f0', color='cyan', linestyle='',
# #             marker='+', markersize=10)
#     plt.show()

# find_errors('ode_piano.wav', 'asdf.mp3')

def analyze_audio(song_name, instrument, audio_length, user_wav, target_audio):
    return find_errors(io.BytesIO(user_wav), io.BytesIO(target_audio))

# import base64
# from pydub import AudioSegment
# 
# with open('testbase64.txt', 'r') as file:
#     encoded = file.read()
#     audio_raw = base64.b64decode(encoded)
#     
#     # 2. Convert WebM to Wav using pydub
#     # This acts as our "C4 to Wave" replacement for modern web audio
#     try:
#         audio_segment = AudioSegment.from_file(io.BytesIO(audio_raw))
#         wav_io = io.BytesIO()
#         audio_segment.export(wav_io, format="wav")
#         user_wav = wav_io.getvalue()
#     except Exception as e:
#         print(f"⚠️ Audio conversion warning: {e}. Using raw data as fallback.")
#         user_wav = audio_raw
#     
#     analyze_audio('a', 'a', 'a', user_wav, user_wav)