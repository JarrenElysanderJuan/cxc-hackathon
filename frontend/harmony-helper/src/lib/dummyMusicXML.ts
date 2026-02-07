/**
 * Dummy MusicXML data for testing rendering and error highlighting.
 * Replace with actual parsed MusicXML from file uploads in production.
 */

export const DUMMY_MUSICXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>Practice Piece</work-title>
  </work>
  <identification>
    <creator type="composer">Demo Composer</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="3">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="4">
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

/**
 * Dummy error data simulating AI feedback analysis.
 * Each entry marks a note position that had an error.
 *
 * TODO: Replace with actual AI analysis results.
 * Structure: measure number, note index within measure, error type, description
 */
export interface NoteError {
  measure: number;
  noteIndex: number;
  type: "pitch" | "timing" | "dynamics";
  description: string;
  severity: "minor" | "moderate" | "major";
}

export const DUMMY_ERRORS: NoteError[] = [
  {
    measure: 1,
    noteIndex: 2,
    type: "pitch",
    description: "Note was slightly flat — expected E4, detected Eb4.",
    severity: "moderate",
  },
  {
    measure: 2,
    noteIndex: 0,
    type: "timing",
    description: "Entered 120ms late — rushed into the beat.",
    severity: "minor",
  },
  {
    measure: 3,
    noteIndex: 1,
    type: "pitch",
    description: "Significantly sharp — expected B4, detected C5.",
    severity: "major",
  },
  {
    measure: 4,
    noteIndex: 3,
    type: "dynamics",
    description: "Volume dropped unexpectedly on the final note.",
    severity: "minor",
  },
];

/**
 * Dummy textual AI feedback summary.
 * TODO: Replace with real AI-generated feedback from backend.
 */
export const DUMMY_FEEDBACK_TEXT = {
  summary:
    "Good effort! Your overall pitch accuracy was 78%. You maintained a steady tempo for most of the piece but rushed slightly in measure 2. Pay attention to the E4 in measure 1 and the B4 in measure 3 — both were out of tune.",
  tips: [
    "Practice measures 1–2 slowly with a metronome at 60 BPM before increasing speed.",
    "Focus on the transition from G4 to A4 in measure 2 — use breath support to stay on pitch.",
    "Record yourself playing just measures 3–4 and compare with the sheet to self-correct.",
  ],
  overallScore: 78,
  pitchAccuracy: 75,
  tempoConsistency: 82,
  dynamics: 80,
};
