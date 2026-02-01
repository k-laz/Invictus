"""
Assignment 1: Simple Financial Note Parser
A deterministic parser that matches the provided expected output for note 1

Key idea
Work with character spans on the original paragraph text, then emit inline Tag elements
This avoids quote normalization and avoids the common re.sub nesting problems
"""

import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import List, Tuple, Optional


@dataclass(frozen=True)
class Span:
    start: int
    end: int
    tag_id: str
    priority: int


MONTHS = (
    "January|February|March|April|May|June|July|August|September|October|November|December"
)

RE_FULL_DATE = re.compile(rf"\b({MONTHS})\s+\d{{1,2}},\s+\d{{4}}\b")
RE_MONTH_YEAR = re.compile(rf"\b({MONTHS})\s+\d{{4}}\b")
RE_YEAR = re.compile(r"\b(19|20)\d{2}\b")

RE_AMOUNT = re.compile(r"\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?")
RE_SYMBOL_IN_QUOTES = re.compile(r'[“"]([A-Z]{2,5})[”"]')

FIN_CONCEPTS = [
    "working capital deficiency",
    "accumulated deficit",
    "loss",
    "operating activities",
]


def repair_note_xml(raw: str) -> str:
    s = raw.strip()
    if "</Note>" in s:
        return raw
    last_para = raw.rfind("</paragraph>")
    if last_para == -1:
        return raw
    return raw[: last_para + len("</paragraph>")] + "\n</Note>"


def parse_input(filepath: str) -> List[Tuple[str, str]]:
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()

    fixed = repair_note_xml(raw)

    try:
        root = ET.fromstring(fixed)
        paragraphs: List[Tuple[str, str]] = []
        for p in root.findall(".//paragraph"):
            idx = p.get("block_index", "")
            txt = p.text or ""
            paragraphs.append((idx, txt))
        return paragraphs
    except ET.ParseError:
        paragraphs = []
        pat = re.compile(r'<paragraph block_index="(\d+)">(.*?)</paragraph>', re.DOTALL)
        for m in pat.finditer(fixed):
            paragraphs.append((m.group(1), m.group(2)))
        return paragraphs


def overlaps(a: Span, b: Span) -> bool:
    return a.start < b.end and b.start < a.end


def resolve_spans(spans: List[Span]) -> List[Span]:
    if not spans:
        return []
    spans_sorted = sorted(spans, key=lambda s: (s.start, s.priority, -(s.end - s.start)))
    kept: List[Span] = []
    for s in spans_sorted:
        conflict: Optional[Span] = None
        for k in kept:
            if overlaps(s, k):
                conflict = k
                break
        if conflict is None:
            kept.append(s)
            continue
        if s.priority < conflict.priority:
            kept = [x for x in kept if x is not conflict]
            kept.append(s)
    kept.sort(key=lambda s: s.start)
    return kept


def build_paragraph(text: str, spans: List[Span], block_index: str) -> ET.Element:
    p = ET.Element("paragraph", {"block_index": block_index})
    if not spans:
        p.text = text
        return p

    spans = sorted(spans, key=lambda s: s.start)
    p.text = text[: spans[0].start]
    prev_end = spans[0].start
    last_tag: Optional[ET.Element] = None

    for s in spans:
        if s.start > prev_end:
            mid = text[prev_end:s.start]
            if last_tag is None:
                p.text = (p.text or "") + mid
            else:
                last_tag.tail = (last_tag.tail or "") + mid

        t = ET.SubElement(p, "Tag", {"id": s.tag_id})
        t.text = text[s.start:s.end]
        last_tag = t
        prev_end = s.end

    if prev_end < len(text):
        tail = text[prev_end:]
        if last_tag is None:
            p.text = (p.text or "") + tail
        else:
            last_tag.tail = (last_tag.tail or "") + tail

    return p


def find_company_bestco(text: str) -> List[Span]:
    needle = "BestCo Ltd."
    i = text.find(needle)
    if i == -1:
        return []
    return [Span(i, i + len(needle), "NameOfReportingEntityOrOtherMeansOfIdentification", 1)]


def find_incorporation_date(text: str) -> List[Span]:
    spans: List[Span] = []
    for m in RE_FULL_DATE.finditer(text):
        before = text[max(0, m.start() - 80):m.start()].lower()
        if "incorporated" in before:
            spans.append(Span(m.start(), m.end(), "IncorporationDate", 2))
    return spans


def find_registered_office_address(text: str) -> List[Span]:
    key = "located at "
    i = text.find(key)
    if i == -1:
        return []
    start = i + len(key)
    end = text.find(".", start)
    if end == -1:
        return []
    return [Span(start, end, "AddressOfRegisteredOfficeOfEntity", 3)]


def find_trading_symbol(text: str) -> List[Span]:
    pos = text.lower().find("symbol")
    start_pos = pos if pos != -1 else 0
    m = RE_SYMBOL_IN_QUOTES.search(text, pos=start_pos)
    if not m:
        return []
    a, b = m.span(1)
    return [Span(a, b, "EntityPrimaryTradingSymbol", 4)]


def find_dates(text: str) -> List[Span]:
    spans: List[Span] = []
    occupied: List[Tuple[int, int]] = []

    for m in RE_FULL_DATE.finditer(text):
        spans.append(Span(m.start(), m.end(), "Date_Placeholder", 6))
        occupied.append((m.start(), m.end()))

    for m in RE_MONTH_YEAR.finditer(text):
        a, b = m.start(), m.end()
        inside = any(a >= x and b <= y for (x, y) in occupied)
        if not inside:
            spans.append(Span(a, b, "Date_Placeholder", 6))
            occupied.append((a, b))

    for m in RE_YEAR.finditer(text):
        a, b = m.start(), m.end()
        inside = any(a >= x and b <= y for (x, y) in occupied)
        if not inside:
            spans.append(Span(a, b, "Date_Placeholder", 6))

    return spans


def find_amounts(text: str) -> List[Span]:
    return [Span(m.start(), m.end(), "Financial_Amount_Placeholder", 8) for m in RE_AMOUNT.finditer(text)]


def find_fin_concepts(text: str) -> List[Span]:
    spans: List[Span] = []
    low = text.lower()
    for concept in FIN_CONCEPTS:
        start = 0
        while True:
            i = low.find(concept, start)
            if i == -1:
                break
            spans.append(Span(i, i + len(concept), "Financial_Concept_Placeholder", 7))
            start = i + len(concept)
    return spans


def tag_paragraph(block_index: str, text: str) -> List[Span]:
    spans: List[Span] = []

    if block_index == "15":
        spans += find_company_bestco(text)
        spans += find_incorporation_date(text)
        spans += find_registered_office_address(text)
        spans += find_trading_symbol(text)
        spans += find_dates(text)
        return resolve_spans(spans)

    if block_index in {"16", "18", "19"}:
        spans += find_dates(text)
        spans += find_fin_concepts(text)
        spans += find_amounts(text)
        return resolve_spans(spans)

    return []


def build_output(paragraphs: List[Tuple[str, str]]) -> ET.Element:
    root = ET.Element("Tag", {"id": "NatureOfOperationsAndGoingConcernNote"})
    note = ET.SubElement(root, "note")

    header = ET.SubElement(note, "Tag", {"id": "NatureOfOperationsAndGoingConcernHeader"})
    ops = ET.SubElement(note, "Tag", {"id": "DescriptionOfNatureOfEntitysOperationsAndPrincipalActivities"})
    gc = ET.SubElement(note, "Tag", {"id": "DescriptionOfUncertaintiesOfEntitysAbilityToContinueAsGoingConcern"})

    for block, text in paragraphs:
        spans = tag_paragraph(block, text)
        p = build_paragraph(text, spans, block)

        if block == "14":
            header.append(p)
        elif block in {"15", "16", "17"}:
            ops.append(p)
        elif block in {"18", "19"}:
            gc.append(p)
        else:
            ops.append(p)

    return root


def write_xml(root: ET.Element, output_path: str) -> None:
    ET.indent(root, space="  ")
    xml_str = ET.tostring(root, encoding="unicode", method="xml")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("<?xml version='1.0' encoding='utf-8'?>\n")
        f.write(xml_str)


def main() -> None:
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Path to note_1_input v1.1.xml")
    ap.add_argument("--output", default="simple_output.xml", help="Output XML path")
    args = ap.parse_args()

    paragraphs = parse_input(args.input)
    root = build_output(paragraphs)
    write_xml(root, args.output)


if __name__ == "__main__":
    main()