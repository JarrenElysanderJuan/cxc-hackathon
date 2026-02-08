import music21
import tempfile
import os
import json
import uuid

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
            
            # search window +/- 0.5 beat
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

            # basically find the closest note to the
            # error, but Leon should have already dealed
            # with this functionality
            for element in candidates:
                diff = abs(element.offset - target_offset)
                if diff < min_diff:
                    min_diff = diff
                    best_match = element

            if best_match:
                best_match.style.color = '#FF0000' 
                
                if best_match.isChord:
                    for n in best_match.notes:
                        n.style.color = '#FF0000'

                error_data = {
                    "type": err_type,
                    "desc": err_desc,
                    "uuid": str(uuid.uuid4()) 
                }

                clean_json = json.dumps(error_data).replace(' ', '_').replace('"', "'")
                best_match.id = f"ERR_DATA:{clean_json}"

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


if __name__ == "__main__":
    filename = "ode-to-joy.xml"
    
    if not os.path.exists(filename):
        print(f"Error: {filename} not found. Please ensure it is in the same folder.")
    else:
        with open(filename, "r") as f:
            xml_input = f.read()

        mock_bpm = 120
        start_measure = 1
        
        mock_errors = [
            ["pitch", 1.0, "Wrong Note (Too Flat)"],
            ["rhythm", 3.5, "Rushed Rhythm"]
        ]

        print("Running markup...")
        
        result_xml = mark_up_xml(xml_input, mock_errors, mock_bpm, start_measure)

        output_filename = "ode_to_joy_marked.xml"
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(result_xml)

        print(f"\nSuccess! Check '{output_filename}' for red notes and lyrics.")