import json

log_path = "/Users/nestorarriagagallegos/.gemini/antigravity/brain/1c50679a-4821-4365-a192-9fcf30b49679/.system_generated/logs/transcript.jsonl"
left_content = None
right_content = None

with open(log_path, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get("type") == "PLANNER_RESPONSE":
                tool_calls = entry.get("tool_calls", [])
                for call in tool_calls:
                    if call.get("name") == "write_to_file":
                        args = call.get("args", {})
                        target = args.get("TargetFile", "")
                        if "LeftControlPanel.tsx" in target:
                            left_content = args.get("CodeContent")
                        if "RightDetailPanel.tsx" in target:
                            right_content = args.get("CodeContent")
        except:
            pass

if left_content:
    with open("src/components/panels/LeftControlPanel.tsx", "w") as out:
        out.write(left_content)
    print("Recovered Left clean")

if right_content:
    with open("src/components/panels/RightDetailPanel.tsx", "w") as out:
        out.write(right_content)
    print("Recovered Right clean")
