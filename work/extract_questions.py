"""Extract the quiz text from the supplied PDF into the app data schema.

The PDF labels sections as "Solutions" but contains no marked answer key.
Correct-option IDs are therefore carefully inferred from question content.
"""
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

PDF = Path(r"C:\Users\SURESH KUMAR\Downloads\ilovepdf_merged.pdf")
OUTPUT = Path("src/data/questions.json")

# Inferred from the wording; these are intentionally not represented as official answers.
KEYS = {
    1: "BCBDDCBAAA", 2: "BAAAAADDCB",
    3: "BBCBCCBCBB", 4: "BDCDCBAADD",
    5: "ADCAABACBD", 6: "BCADDBBDDC",
    7: "BBBBCCBAAB", 8: "CDBBDCCBDB", 9: "ACBABBBACC",
    10: "BBCAACDDAB", 11: "DBCBCADCDB",
    12: "BBCCCABADC",
}


def clean(text: str) -> str:
    text = text.replace("�", "-")
    return re.sub(r"\s+", " ", text).strip()


def assignment_chunks(text: str):
    marker = re.compile(r"Assignment\s+(\d+)\s+Solutions\s+\(2026\)")
    found = list(marker.finditer(text))
    if len(found) != 12:
        raise ValueError(f"Expected 12 assignment headings, found {len(found)}")
    for index, match in enumerate(found):
        end = found[index + 1].start() if index + 1 < len(found) else len(text)
        yield int(match.group(1)), text[match.end():end]


def parse_questions(chunk: str):
    question_marker = re.compile(r"(?:^|\n)\s*(\d{1,2})\s*\.?\s+")
    matches = list(question_marker.finditer(chunk))
    if len(matches) != 10:
        raise ValueError(f"Expected 10 question markers, found {len(matches)} in {chunk[:80]!r}")
    records = []
    for index, marker in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(chunk)
        block = chunk[marker.end():end]
        option_matches = list(re.finditer(r"\n\s*\(([a-d])\)\s*", block))
        if len(option_matches) != 4:
            raise ValueError(f"Question {marker.group(1)} has {len(option_matches)} options: {block!r}")
        question = clean(block[:option_matches[0].start()])
        options = []
        for option_index, option in enumerate(option_matches):
            option_end = option_matches[option_index + 1].start() if option_index < 3 else len(block)
            options.append({
                "id": option.group(1).upper(),
                "text": clean(block[option.end():option_end]),
            })
        records.append((int(marker.group(1)), question, options))
    return records


def main():
    reader = PdfReader(PDF)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    questions = []
    for assignment, chunk in assignment_chunks(text):
        parsed = parse_questions(chunk)
        if [number for number, _, _ in parsed] != list(range(1, 11)):
            raise ValueError(f"Assignment {assignment} has non-sequential question numbers")
        key = KEYS[assignment]
        if len(key) != 10:
            raise ValueError(f"Assignment {assignment} needs 10 inferred answers; found {len(key)}")
        for number, question, options in parsed:
            questions.append({
                "id": f"a{assignment}q{number}",
                "assignment": assignment,
                "week": assignment,
                "question": question,
                "options": options,
                "correctOptionId": key[number - 1],
                "answerSource": "inferred",
                "explanation": "Answer inferred from the question wording; the source PDF does not provide a marked official answer key.",
            })
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(questions)} questions to {OUTPUT}")


if __name__ == "__main__":
    main()
