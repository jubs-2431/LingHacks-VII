# ElderShield — Before you sign, know what it means.

ElderShield is a legal-document risk explainer designed for elderly people, caregivers, and everyday users who struggle with legal jargon, healthcare paperwork, leases, financial agreements, and scams.

---

## Inspiration
Legal documents are often written in language that is technically precise but completely inaccessible to ordinary people. This is especially harmful for elderly adults, who frequently face leases, medical forms, insurance agreements, financial documents, and online contracts filled with jargon, deadlines, penalties, and rights waivers. We wanted to build a computational-linguistics tool that does not merely summarize legal text, but identifies the hidden responsibilities, costs, and risks created by the language itself.

## What it does
ElderShield analyzes legal or official documents and highlights clauses that may create risk for the reader. It detects categories such as money risk, rights waivers, deadline burdens, proof burdens, ambiguity burdens, data-sharing consent, and pressure language. For each risky clause, it provides a plain-English explanation, why the clause matters, a severity level, and a question the user should ask before signing.

## Why it is Computational Linguistics
Unlike generic summarizers that dump the entire document into an LLM, ElderShield implements a structured NLP pipeline that analyzes:
- **Legal Modality**: Distinguishing speech acts of permission ("may"), obligation ("must", "shall", "is required to"), and prohibition.
- **Ambiguity & Vagueness**: Identifying patterns that grant discretionary power to the drafting party (e.g., "at our sole discretion", "as necessary").
- **Rights Waivers & Obligation Triggers**: Extracting speech acts where signing commits the user to severe legal shifts (e.g., "binding arbitration", "waive class action").

## Unique Spin
Most AI document tools summarize text. ElderShield performs **linguistic risk extraction**. It focuses on how legal language places burdens on the reader through words like "must," "waive," "binding arbitration," "subject to review," "adequate documentation," and "failure to comply." This makes the project more than a chatbot: it is a fine-print friction map designed around vulnerable users.

## Tech Stack

### Frontend
- **Framework**: Next.js (TypeScript, React App Router)
- **Styling**: Tailwind CSS
- **Features**: Drag-and-drop PDF upload (`react-dropzone`), Web Speech API for slow/clear text-to-speech, and global high-contrast Accessibility **Elder Mode**.

### Backend
- **Framework**: FastAPI (Python)
- **NLP Engine**: spaCy for sentence boundary detection, regex pattern classification, and scoring algorithms.
- **PDF Extraction**: `pdfplumber` for structured PDF content extraction.

---

## Architecture

```
                                    User
                                     ↓
                          Frontend Upload/Paste Page
                                     ↓
                               Backend FastAPI
                                     ↓
                              Document Parser
                                     ↓
                          Sentence/Clause Splitter
                                     ↓
                            Risk Detection Engine
                                     ↓
                             Risk Scoring Engine
                                     ↓
                      Plain-English Explanation Generator
                                     ↓
                            Frontend Risk Dashboard
```

---

## How to Run Locally

### 1. Backend Setup (FastAPI)
Navigate to the `backend` folder:
```bash
cd backend
```

Set up a virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Download the spaCy lightweight model:
```bash
python3 -m spacy download en_core_web_sm
```

Run the backend server:
```bash
python3 main.py
```
The FastAPI swagger documentation will be active at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)
Navigate to the `frontend` folder:
```bash
cd frontend
```

Install node packages:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
The website will be active at `http://localhost:3000`.

---

## Demo Input
You can test the application using this sample clause:
> "By signing this agreement, you agree to resolve all disputes through binding arbitration and waive your right to participate in any class action. This agreement will automatically renew unless cancelled in writing at least 30 days before the renewal date. Failure to submit payment within 10 business days may result in late fees. We may share your information with third-party service providers as needed. Additional documentation may be required at our discretion."

---

## Limitations
- **Rules-Based Classifier**: Current detection relies on high-quality vocabularies and regex, which is highly accurate for common legal templates but may miss rare, novel jargon phrasing.
- **Educational Scope**: Explanations are template-driven for accuracy and safety, rather than providing custom legal advice.

## Future Work
- **Hybrid LLM Layer**: Incorporating localized, self-hosted LLMs to translate highly custom legal clauses, using our rule matches as grounding context.
- **OCR Integration**: Scanning physical documents or images of printed contracts for users who do not have digital files.
- **Caregiver Share Panel**: Allowing users to securely email the generated checklist and document map to their adult children, guardians, or lawyers.

---

## Important Disclaimer
> [!IMPORTANT]
> ElderShield is **not legal advice**. It is an educational tool that helps users identify possible risks and questions to ask before signing legal or official documents.
