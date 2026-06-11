import re

log_path = "/Users/nestorarriagagallegos/.gemini/antigravity/brain/1c50679a-4821-4365-a192-9fcf30b49679/.system_generated/logs/transcript.jsonl"
with open(log_path, 'r') as f:
    text = f.read()

# Find LeftControlPanel
match = re.search(r'Total Lines: 581.*?The following code has been modified.*?(1: import React.*?)\\nThe above content shows the entire', text, re.DOTALL)
if match:
    content = match.group(1)
    # unescape json newlines if needed, but since it's a raw string in json, we process it
    # wait, the file is read as text. json newlines are literal \n
    lines = content.split('\\n')
    out_lines = []
    for line in lines:
        parts = line.split(": ", 1)
        if len(parts) == 2 and parts[0].isdigit():
            out_lines.append(parts[1])
    
    with open("src/components/panels/LeftControlPanel.tsx", "w") as out:
        out.write('\n'.join(out_lines))
    print("Extracted LeftControlPanel")
else:
    print("LeftControlPanel not found with regex")

# Find RightDetailPanel
# Since we didn't do view_file for RightDetailPanel, how do we get it?
# Let's check git status just in case git is initialized in the sub-folder
