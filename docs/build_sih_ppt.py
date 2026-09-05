import copy, shutil
from pptx import Presentation
from pptx.util import Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

SRC = "/Users/tohraan/Downloads/SIH2026-IDEA-Presentation-Format.pptx"
OUT = "/Users/tohraan/Downloads/build/docs/SIH2026_ChainIDVault_IdeaPPT.pptx"

TNR = "Times New Roman"
INK = RGBColor(0x00, 0x00, 0x00)
ACCENT = RGBColor(0x1F, 0x30, 0x64)   # deep navy, matches the template's band

prs = Presentation(SRC)

# ---------------------------------------------------------------- helpers
from pptx.oxml.ns import qn
def no_bullet(p):
    """Template list formatting puts a glyph on the retained first paragraph."""
    pPr = p._p.get_or_add_pPr()
    for tag in ("a:buChar", "a:buAutoNum", "a:buNone"):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    pPr.append(pPr.makeelement(qn("a:buNone"), {}))
    pPr.set("indent", "0")
    pPr.set("marL", "0")

def clear(tf):
    tf.clear()
    # tf.clear() leaves one empty paragraph
    return tf

def add(tf, text, size, bold=False, first=False, space_before=0, color=INK, indent=0):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = PP_ALIGN.LEFT
    if space_before:
        p.space_before = Pt(space_before)
    p.space_after = Pt(2)
    if indent:
        p.level = indent
    r = p.add_run()
    r.text = text
    r.font.name = TNR
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    if first:
        no_bullet(p)
    return p

def box(slide, name):
    for sh in slide.shapes:
        if sh.name == name:
            return sh
    return None

def retitle_oval(slide, team):
    for sh in slide.shapes:
        if sh.name.startswith("Oval"):
            tf = sh.text_frame
            clear(tf)
            add(tf, team, 11, bold=True, first=True, color=ACCENT)

TEAM = "[TEAM NAME]"

# ================================================================ SLIDE 1
s = prs.slides[0]
tf = clear(box(s, "TextBox 9").text_frame)
rows = [
    ("Problem Statement ID – ", "SIH26125"),
    ("Problem Statement Title – ", "Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management"),
    ("Theme – ", "Blockchain & Cybersecurity"),
    ("PS Category – ", "Software"),
    ("Team ID – ", "[ENTER TEAM ID]"),
    ("Team Name (Registered on portal) – ", "[ENTER TEAM NAME]"),
]
for i, (label, value) in enumerate(rows):
    p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
    p.space_after = Pt(10)
    r1 = p.add_run(); r1.text = label
    r1.font.name = TNR; r1.font.size = Pt(17); r1.font.bold = True; r1.font.color.rgb = INK
    r2 = p.add_run(); r2.text = value
    r2.font.name = TNR; r2.font.size = Pt(17); r2.font.bold = False; r2.font.color.rgb = INK

sub = box(s, "Subtitle 3")
tf = clear(sub.text_frame)
add(tf, "ChainID Vault", 30, bold=True, first=True, color=ACCENT)
add(tf, "Tamper-proof custody of identity, access and assets", 17, bold=False)

# ================================================================ SLIDE 2
s = prs.slides[1]
retitle_oval(s, TEAM)
t = box(s, "Title 1").text_frame
t.paragraphs[0].runs[0].text = "IDEA TITLE"
tb = box(s, "TextBox 8")
tb.top, tb.left, tb.width, tb.height = Emu(1_150_000), Emu(430_000), Emu(9_250_000), Emu(5_100_000)
tf = clear(tb.text_frame)
add(tf, "ChainID Vault — enforcement of identity, access and asset custody inside smart contracts, not inside an editable database.",
    16, bold=True, first=True, color=ACCENT)

add(tf, "Proposed Solution (Describe your Idea/Solution/Prototype)", 16, bold=True, space_before=10)
for b in [
    "Permissioned blockchain platform where every identity, role grant and asset-custody record is on-chain.",
    "Identity = cryptographic keypair + lifecycle status (Active / Suspended / Revoked) + hash of an off-chain personnel record.",
    "Asset = ERC-721 token representing one controlled item, bound to a verified identity.",
    "Sensitive documents stay off-chain; only their keccak256 fingerprint is anchored, so nothing private is published.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "How it addresses the problem", 16, bold=True, space_before=8)
for b in [
    "No central database to compromise — there is no editable row for a role, an owner or a log entry.",
    "A revoked identity cannot receive an asset by any route; the rule is enforced at one chokepoint every transfer passes through.",
    "The audit trail is the chain's own append-only event log, so it cannot be edited or selectively deleted.",
    "Any third party can verify an asset without an account and without trusting our operator.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "Innovation and uniqueness of the solution", 16, bold=True, space_before=8)
for b in [
    "Single-chokepoint enforcement closes the standard ERC-721 transfer bypass that similar implementations leave open.",
    "EIP-712 proof of control: single-use, time-bound and domain-separated, so a captured signature cannot be replayed.",
    "Hybrid design keeps personal data off-chain while retaining tamper-evidence through hash anchoring.",
    "Even the administrator who created an identity cannot override the rules — demonstrated live, not claimed.",
]:
    add(tf, "•  " + b, 13.5)

# ================================================================ SLIDE 3
s = prs.slides[2]
retitle_oval(s, TEAM)
tb = box(s, "TextBox 8")
tb.top, tb.left, tb.width, tb.height = Emu(1_150_000), Emu(610_000), Emu(9_400_000), Emu(5_100_000)
tf = clear(tb.text_frame)
add(tf, "Technologies to be used (e.g. programming languages, frameworks, hardware)", 16, bold=True, first=True)
for b in [
    "Smart contracts: Solidity 0.8.24, OpenZeppelin 5.6 (AccessControl, ERC-721 Enumerable), Hardhat, Mocha/Chai.",
    "Frontend: React 18, Vite, Tailwind CSS, ethers.js v6 — the browser calls contracts directly.",
    "Cryptography: EIP-712 typed-data signatures for proof of control; keccak256 for document anchoring.",
    "No backend server and no database, by design — a database is the component whose editability the project removes.",
    "Deployment target: permissioned EVM chain (Hyperledger Besu / Quorum). Local node used for demonstration.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "Methodology and process for implementation (Flow Charts / Images / working prototype)", 16, bold=True, space_before=10)
for b in [
    "Two contracts: IdentityRegistry governs the identity lifecycle and proof of control; AssetNFT governs custody and calls the registry before every issue or transfer.",
    "The system invariant — an asset may only be held by an active identity — is enforced inside _update, the one internal function every mint, transfer and burn passes through.",
    "Working prototype implements the full contractor custody pipeline, run live end to end:",
]:
    add(tf, "•  " + b, 13.5)
add(tf, "Onboard  →  Issue equipment  →  Prove identity at the gate  →  Verify item and paperwork  →  Offboard  →  Attempt refused on-chain",
    13, bold=True, space_before=4, color=ACCENT)
add(tf, "•  Verification: 45 automated contract tests, including negative tests for replay, impersonation, expiry and tampering.", 12.5, space_before=4)

# ================================================================ SLIDE 4
s = prs.slides[3]
retitle_oval(s, TEAM)
tb = box(s, "TextBox 8")
tb.top, tb.left, tb.width, tb.height = Emu(1_150_000), Emu(610_000), Emu(9_400_000), Emu(5_100_000)
tf = clear(tb.text_frame)
add(tf, "Analysis of the feasibility of the idea", 16, bold=True, first=True)
for b in [
    "A working prototype already exists: both contracts, the full workflow interface, and 45 passing tests.",
    "Built entirely on audited, widely used libraries — no novel cryptography and no unproven components.",
    "Runs on a permissioned chain, so there is no public-network gas cost and no external dependency.",
    "Adoption is incremental: it can run alongside an existing asset register before replacing it.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "Potential challenges and risks", 16, bold=True, space_before=10)
for b in [
    "Administrator key compromise — a single key currently holds full administrative authority.",
    "On-chain read cost grows with registry size; an unbounded read becomes uncallable at scale.",
    "The chain proves the integrity of the record, not the identity of the physical object.",
    "Key loss would otherwise strand an identity and every asset it holds.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "Strategies for overcoming these challenges", 16, bold=True, space_before=10)
for b in [
    "Multi-signature control with a timelock for the administrative role, removing the single point of failure.",
    "Paginated on-chain reads (implemented) plus an off-chain indexer for large registries.",
    "Tamper-evident physical tagging bound to the asset identifier, closing the object-to-record gap.",
    "On-chain key rotation that preserves identity continuity (implemented), so key loss is recoverable.",
]:
    add(tf, "•  " + b, 13.5)

# ================================================================ SLIDE 5
s = prs.slides[4]
retitle_oval(s, TEAM)
tb = box(s, "TextBox 8")
tb.top, tb.left, tb.width, tb.height = Emu(1_150_000), Emu(610_000), Emu(9_400_000), Emu(5_100_000)
tf = clear(tb.text_frame)
add(tf, "Potential impact on the target audience", 16, bold=True, first=True)
for b in [
    "Security administrators: revocation takes effect immediately and cannot be bypassed, including by themselves.",
    "Stores and custody officers: one verifiable custody record instead of a register plus paper forms that can disagree.",
    "Internal auditors: complete history reconstructable from the chain, without trusting the system operator.",
    "External verifiers and receiving officers: can confirm authenticity and current custody with no account and no login.",
]:
    add(tf, "•  " + b, 13.5)

add(tf, "Benefits of the solution (social, economic, environmental, etc.)", 16, bold=True, space_before=10)
for b in [
    "Security: authorisation lives in contract code, so a compromised database or insider cannot grant privilege or rewrite history.",
    "Operational: instant, enforced offboarding removes orphaned custody records — the gap that follows every departure today.",
    "Economic: less manual audit effort, fewer disputes over custody, and reduced loss of controlled equipment.",
    "Compliance and privacy: a tamper-evident chain of custody, while personal data stays off-chain and erasable.",
    "Strategic: a defensible custody trail for sensitive and defence-related equipment across sites and contractors.",
]:
    add(tf, "•  " + b, 13.5)

# ================================================================ SLIDE 6
s = prs.slides[5]
retitle_oval(s, TEAM)
tb = box(s, "TextBox 8")
tb.top, tb.left, tb.width, tb.height = Emu(1_150_000), Emu(610_000), Emu(9_400_000), Emu(5_100_000)
tf = clear(tb.text_frame)
add(tf, "Details / Links of the reference and research work", 16, bold=True, first=True)
refs = [
    ("ERC-721 Non-Fungible Token Standard", "https://eips.ethereum.org/EIPS/eip-721"),
    ("EIP-712 Typed Structured Data Hashing and Signing", "https://eips.ethereum.org/EIPS/eip-712"),
    ("OpenZeppelin Contracts v5 — AccessControl and ERC-721", "https://docs.openzeppelin.com/contracts/5.x/"),
    ("Solidity Language Documentation and Security Considerations", "https://docs.soliditylang.org"),
    ("NIST SP 800-63-3, Digital Identity Guidelines", "https://pages.nist.gov/800-63-3/"),
    ("OWASP Smart Contract Top 10", "https://owasp.org/www-project-smart-contract-top-10/"),
    ("Hyperledger Besu — permissioned EVM networks", "https://besu.hyperledger.org"),
    ("W3C Decentralized Identifiers (DID) v1.0 — reviewed for the identity model", "https://www.w3.org/TR/did-core/"),
]
for name, url in refs:
    p = tf.add_paragraph(); p.space_after = Pt(3)
    r = p.add_run(); r.text = "•  " + name + " — "
    r.font.name = TNR; r.font.size = Pt(13); r.font.color.rgb = INK
    r2 = p.add_run(); r2.text = url
    r2.font.name = TNR; r2.font.size = Pt(13); r2.font.color.rgb = ACCENT

add(tf, "Prototype repository", 16, bold=True, space_before=10)
p = tf.add_paragraph()
r = p.add_run(); r.text = "•  Source code, 45 contract tests, security audit and threat model — "
r.font.name = TNR; r.font.size = Pt(13); r.font.color.rgb = INK
r2 = p.add_run(); r2.text = "https://github.com/tohraan/chainid-vault"
r2.font.name = TNR; r2.font.size = Pt(13); r2.font.color.rgb = ACCENT

# ============================================ delete the instructions slide
xml_slides = prs.slides._sldIdLst
slides = list(xml_slides)
prs.part.drop_rel(slides[6].rId)
xml_slides.remove(slides[6])

prs.save(OUT)
print("saved:", OUT)
print("slides:", len(Presentation(OUT).slides))
