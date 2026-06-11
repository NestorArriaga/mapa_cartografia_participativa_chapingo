import json
import re

log_path = "/Users/nestorarriagagallegos/.gemini/antigravity/brain/1c50679a-4821-4365-a192-9fcf30b49679/.system_generated/logs/transcript.jsonl"
with open(log_path, 'r') as f:
    text = f.read()

# Look for write_to_file calls or any full content of RightDetailPanel.tsx
# "TargetFile":".../RightDetailPanel.tsx" and "CodeContent":"..."
matches = re.finditer(r'"TargetFile":"[^"]*RightDetailPanel\.tsx".*?"CodeContent":"(.*?)"', text)
last_content = None
for m in matches:
    last_content = m.group(1)

if last_content:
    # unescape json
    # we need to be careful with escaping.
    # since we used re over the raw json string, it's still json-escaped.
    # let's parse the line instead.
    pass

# Better approach: parse json lines
with open(log_path, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get("type") == "PLANNER_RESPONSE":
                # Look inside tool_calls
                for call in entry.get("tool_calls", []):
                    if call.get("name") == "write_to_file":
                        args = call.get("args", {})
                        if "RightDetailPanel.tsx" in args.get("TargetFile", ""):
                            last_content = args.get("CodeContent")
        except:
            pass

if last_content:
    with open("src/components/panels/RightDetailPanel.tsx", "w") as out:
        out.write(last_content)
    print("Recovered RightDetailPanel.tsx from write_to_file")
else:
    print("Could not find write_to_file for RightDetailPanel")
