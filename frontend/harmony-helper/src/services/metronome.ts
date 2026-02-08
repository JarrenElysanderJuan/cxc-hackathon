class MetronomeService {
    private audioContext: AudioContext | null = null;
    private isPlaying: boolean = false;
    private bpm: number = 120;
    private nextNoteTime: number = 0.0;
    private timerID: number | null = null;
    private lookahead: number = 25.0; // ms
    private scheduleAheadTime: number = 0.1; // s
    private currentBeatInBar: number = 0;
    private beatsPerBar: number = 4;

    constructor() {
        // defer AudioContext creation until interaction
    }

    private ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    public setBpm(bpm: number) {
        this.bpm = bpm;
    }

    public start() {
        this.ensureAudioContext();
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentBeatInBar = 0;
        this.nextNoteTime = this.audioContext!.currentTime + 0.1;
        this.scheduler();
    }

    public stop() {
        this.isPlaying = false;
        if (this.timerID) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    public playCountIn(beats: number = 4): Promise<void> {
        return new Promise((resolve) => {
            this.ensureAudioContext();
            let beatCount = 0;

            const scheduleCountIn = () => {
                if (beatCount >= beats) {
                    resolve();
                    return;
                }

                const time = this.audioContext!.currentTime + (beatCount * (60.0 / this.bpm));
                this.scheduleNote(beatCount, time); // 0 is usually the accent beat

                beatCount++;
                // We schedule the "resolve" after the last beat duration
                if (beatCount === beats) {
                    setTimeout(() => resolve(), (60.0 / this.bpm) * 1000); // approximate wait for last beat
                } else {
                    // simple recursion for count-in sequence if we wanted precise scheduling vs loop
                    // actually, for count-in, let's just use the main scheduler but with a limit
                }
            };

            // Simple implementation for count-in: 
            // Schedule N beeps immediately in the future
            const now = this.audioContext!.currentTime;
            const beatDuration = 60.0 / this.bpm;

            for (let i = 0; i < beats; i++) {
                this.scheduleNote(i % 4, now + (i * beatDuration));
            }

            // Resolve after the full duration of count-in
            setTimeout(() => resolve(), beats * beatDuration * 1000);
        });
    }

    private nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeatInBar++;
        if (this.currentBeatInBar >= this.beatsPerBar) {
            this.currentBeatInBar = 0;
        }
    }

    private scheduleNote(beatNumber: number, time: number) {
        const osc = this.audioContext!.createOscillator();
        const envelope = this.audioContext!.createGain();

        osc.frequency.value = (beatNumber % this.beatsPerBar === 0) ? 1000 : 800;
        envelope.gain.value = 1;

        // envelope
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext!.destination);

        osc.start(time);
        osc.stop(time + 0.03);
    }

    private scheduler() {
        if (!this.audioContext) return;

        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
            this.nextNote();
        }

        if (this.isPlaying) {
            this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    public toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

export const metronomeService = new MetronomeService();
