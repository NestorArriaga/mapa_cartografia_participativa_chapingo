import json

log_path = "/Users/nestorarriagagallegos/.gemini/antigravity/brain/1c50679a-4821-4365-a192-9fcf30b49679/.system_generated/logs/transcript.jsonl"
with open(log_path, 'r') as f:
    lines = f.readlines()

for line in reversed(lines):
    try:
        entry = json.loads(line)
        if entry.get("type") == "TOOL_RESPONSE" and "output" in entry.get("content", ""):
            content = entry["content"]
            if "LeftControlPanel.tsx" in content and "Total Lines:" in content:
                # Extract the file
                output = content
                file_lines = []
                capture = False
                for c_line in output.split('\n'):
                    if c_line.startswith("1: ") and not capture:
                        capture = True
                    if capture and c_line.startswith("The above content"):
                        capture = False
                    if capture:
                        # strip the line number prefix (e.g. "1: ")
                        parts = c_line.split(": ", 1)
                        if len(parts) == 2 and parts[0].isdigit():
                            file_lines.append(parts[1])
                
                with open("src/components/panels/LeftControlPanel.tsx", "w") as out:
                    out.write('\n'.join(file_lines))
                print("Recovered LeftControlPanel.tsx")
                break
    except:
        pass
