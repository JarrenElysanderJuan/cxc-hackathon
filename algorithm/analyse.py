import librosa
import matplotlib.pyplot as plt
import numpy as np
import math

def extract_features(file_path):
    # load the file
    y, sr = librosa.load(file_path)

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

    # remove insignificant onsets
    onset_frames_lst = []
    for i in range(onset_frames.shape[0]):
        if not (math.isnan(f0_note[onset_frames[i]])
                and math.isnan(f0_note[onset_frames[min(i + 4, onset_frames.shape[0] - 1)]])):
            onset_frames_lst.append(onset_frames[i])

    clean_onset_frames = np.asarray(onset_frames_lst)

    # get list of notes and time of each onset
    onset_pitches = np.ndarray((clean_onset_frames.shape[0], 2))
    for i in range(clean_onset_frames.shape[0]):
        frame = clean_onset_frames[i]
#        time = times[frame]
        note = f0_note[frame]
        try:
            if not math.isnan(f0_note[frame + 4]):
                note = f0_note[frame + 4]
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
    
    #plot_graph()
    
    return f0_note, onset_pitches, times

def find_matching_index(wp, frame):
    for i in range(wp.shape[0]):
        if wp[i, 0] == frame:
            return wp[i, 1]

def find_errors(path_perfect, path_played):
    f0_perf, onsets_perf, times = extract_features(path_perfect)
    f0_play, onsets_play, _ = extract_features(path_played)
    
    f0_perf[np.isnan(f0_perf)] = 1
    f0_perf = librosa.hz_to_midi(f0_perf)
    f0_play[np.isnan(f0_play)] = 1
    f0_play = librosa.hz_to_midi(f0_play)
    
    onsets_perf_arr = np.full(f0_perf.shape, np.nan)
    onsets_play_arr = np.full(f0_play.shape, np.nan)
    onsets_perf_arr[onsets_perf[:, 0].astype(np.int64)] = onsets_perf[:, 1]
    onsets_play_arr[onsets_play[:, 0].astype(np.int64)] = onsets_play[:, 1]
    
    
    onsets_perf_d = np.full(f0_perf.shape, 0)
    onsets_play_d = np.full(f0_play.shape, 0)
    onsets_perf_d[onsets_perf[:, 0].astype(np.int64)] = onsets_perf[:, 1]
    onsets_play_d[onsets_play[:, 0].astype(np.int64)] = onsets_play[:, 1]

    D, wp = librosa.sequence.dtw(f0_perf[np.newaxis, :],
                                   f0_play[np.newaxis, :],
                                   subseq=True)
    wp = np.flip(wp, 0)
    
    total_diff = 0
    for frame, note in onsets_perf:
        play_frame = find_matching_index(wp, frame)

        found_note = False
        note_frame = None
        for i in range(max(0, play_frame - 5), min(play_frame + 5,
                                                    onsets_play_arr.shape[0] - 1)):
            if not np.isnan(onsets_play_arr[i]):
                found_note = True
                note_frame = i
        
        if not found_note:
            print(f"Missed at {times[int(frame)]}")
    
    adj_perf = np.ndarray(wp.shape[0])
    adj_play = np.ndarray(wp.shape[0])
    onset_adj_perf = np.ndarray(wp.shape[0])
    onset_adj_play = np.ndarray(wp.shape[0])
    times_adj = np.ndarray(wp.shape[0])
    for i in range(wp.shape[0]):
        adj_perf[i] = f0_perf[wp[i, 0]]
        adj_play[i] = f0_play[wp[i, 1]]        
        onset_adj_perf[i] = onsets_perf_arr[wp[i, 0]]        
        onset_adj_play[i] = onsets_play_arr[wp[i, 1]]        

        times_adj[i] = times[wp[i, 0]]
    
    adj_perf[adj_perf == 1] = np.nan
    adj_play[adj_play == 1] = np.nan
    
    fig, ax = plt.subplots()
#     ax.plot(times_adj, adj_perf, label='f0', color='cyan', linewidth=1)
#     ax.plot(times_adj, adj_play, label='f0', color='red', linewidth=1)
#     ax.plot(times_adj, onset_adj_perf, label='f0', color='cyan', linestyle='',
#             marker='+', markersize=10)
    ax.plot(times_adj, onset_adj_play, label='f0', color='red', linestyle='',
            marker='+', markersize=10)

#    ax.plot(_, onsets_play_arr, label='f0', color='cyan', linestyle='',
#             marker='+', markersize=10)
    plt.show()

find_errors('ode_to_joy_perfect.wav', 'ode_miss.wav')
# find_errors('ode_to_joy_perfect.wav')