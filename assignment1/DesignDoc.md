# Assignment 1: Vertical Parsing & Tagging

## Design Document

## Objective

The goal of this system is to transform an extracted financial statement note into a structured XML representation with precise semantic tagging. The design prioritizes determinism, exact span control, and reproducibility to support downstream financial reporting and validation workflows.

---

## Paragraph Extraction

Each `<paragraph>` element is extracted along with its `block_index`.

Full paragraph text is obtained using complete text traversal rather than simple `.text` access to avoid silent character loss or formatting issues that can occur in XML produced by document extraction pipelines.

---

## Subsection Classification

Paragraphs are grouped into semantic subsections.

For this note, subsection classification is deterministic:

- Block 14: Section header
- Blocks 15–17: Nature of operations and principal activities
- Blocks 18–19: Going concern uncertainties

---

## Input Normalization

The input XML is assumed to originate from automated document extraction and may contain minor textual defects. A minimal, deterministic normalization step is applied prior to tagging to correct known issues while preserving original content as much as possible.

Normalization is intentionally limited in scope and runs before any tagging logic to keep semantic extraction rules clean and reproducible.

---

## Span Detection

Each semantic element is detected independently using regex or string-anchored rules.

### Elements Detected

- Reporting entity name
- Incorporation date
- Registered office address
- Trading symbol
- Dates
- Financial amounts
- Selected financial concepts

Each detector outputs **candidate spans** defined by:

- Start index
- End index
- Tag identifier
- Priority

No tags are inserted during detection.

---

## Overlap Resolution

Multiple detectors may identify overlapping spans.

Overlaps are resolved deterministically using:

1. Tag priority
2. Span length (longer spans win when priorities are equal)

This guarantees stable and predictable conflict resolution without producing nested or malformed tags.

---

## Inline Tag Emission

Tags are inserted only after all spans are finalized.

Paragraphs are reconstructed by slicing the original text and emitting `<Tag>` elements with correct `text` and `tail` values. All untagged text is preserved exactly.

This approach avoids common issues associated with regex-based replacement, including nested tags, duplicated content, and altered punctuation.

---

## Output Generation

The final output strictly adheres to the provided XML schema:

- A root `<Tag>` element wrapping the note
- Nested subsection `<Tag>` elements
- `<paragraph>` elements containing inline `<Tag>` children

No additional formatting or content is introduced.

---

## Rationale for a Rule-Based Approach

A rule-based system was chosen over probabilistic or LLM-based approaches to guarantee deterministic output and exact span boundaries.
