import json
import pathlib

root = pathlib.Path(r"D:\Counseling Agent\qa\transcripts")
for p in sorted(root.glob("*.json")):
    data = json.loads(p.read_text(encoding="utf-8"))
    print("\n###", data["id"], "-", data["title"])
    for i, turn in enumerate(data["turns"], 1):
        print(f"{i}. U: {turn['user']}")
        print(
            f"   A[risk={turn['riskLevel']}/{turn['riskType']} "
            f"events={','.join(turn['events'])}]: {turn['reply'][:600]}"
        )
