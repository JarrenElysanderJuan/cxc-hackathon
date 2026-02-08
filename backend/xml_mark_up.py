import music21
import tempfile
import os
import json # Added JSON for cleaner data transport

def mark_up_xml(xml_content, errors, bpm, starting_measure):
    try:
        score = music21.converter.parse(xml_content, format='musicxml')

        if starting_measure > 1:
            score = score.measures(starting_measure, None)

        flat_score = score.flatten()
        base_offset = flat_score.lowestOffset

        for error in errors:
            err_type = error[0]
            err_time = error[1]
            err_desc = error[2]

            beats_from_start = err_time * (bpm / 60.0)
            target_offset = base_offset + beats_from_start
            
            # Search window +/- 0.5 beat
            window = 0.5
            candidates = flat_score.getElementsByOffset(
                target_offset - window, 
                target_offset + window, 
                includeEndBoundary=False,
                mustBeginInSpan=False, 
                mustFinishInSpan=False,
                classList=[music21.note.Note, music21.chord.Chord]
            )

            best_match = None
            min_diff = float('inf')

            for element in candidates:
                diff = abs(element.offset - target_offset)
                if diff < min_diff:
                    min_diff = diff
                    best_match = element

            if best_match:
                # 1. VISUAL: Color it red
                best_match.style.color = 'red'
                if best_match.isChord:
                    for n in best_match.notes:
                        n.style.color = 'red'
                
                # 2. DATA: Attach structured data as a "Lyric"
                # We use a JSON string so the frontend can easily parse 'type', 'time', and 'desc'
                error_data = {
                    "type": err_type,
                    "time": err_time,
                    "desc": err_desc
                }
                
                # Prefix with "ERR_JSON:" so frontend knows this is metadata, not a lyric
                annotation = "ERR_JSON:" + json.dumps(error_data)
                best_match.addLyric(annotation)

        with tempfile.NamedTemporaryFile(suffix=".musicxml", delete=False) as tmp:
            score.write('musicxml', fp=tmp.name)
            tmp.close()
            with open(tmp.name, 'r', encoding='utf-8') as f:
                new_xml_content = f.read()
            os.remove(tmp.name)
            
        return new_xml_content

    except Exception as e:
        print(f"Markup failed: {e}")
        if isinstance(xml_content, bytes):
            return xml_content.decode('utf-8')
        return xml_content