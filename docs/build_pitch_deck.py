from pptx import Presentation
from pptx.util import Inches as In, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image
import os

OUT = "/Users/tohraan/Downloads/build/docs/ChainIDVault_Pitch_Deck.pptx"
S = "/Users/tohraan/Downloads/build/docs/screens"

INK   = RGBColor(0x1C,0x1B,0x1A)
MUTE  = RGBColor(0x6B,0x68,0x62)
LINE  = RGBColor(0xD6,0xD3,0xCD)
SOFT  = RGBColor(0xF2,0xF1,0xEE)
ACC   = RGBColor(0xFC,0xBD,0x31)
RED   = RGBColor(0xBC,0x1C,0x1C)
REDBG = RGBColor(0xFD,0xEC,0xEC)
GRN   = RGBColor(0x2E,0x9E,0x5B)
GRNBG = RGBColor(0xE7,0xF4,0xEC)
BLU   = RGBColor(0x3B,0x8F,0xD9)
WHITE = RGBColor(0xFF,0xFF,0xFF)
BLACK = RGBColor(0x00,0x00,0x00)

prs = Presentation()
prs.slide_width, prs.slide_height = In(13.333), In(7.5)
BLANK = prs.slide_layouts[6]
W = 13.333

def slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb = WHITE; bg.line.fill.background()
    bg.shadow.inherit = False
    return s

def txt(s, x, y, w, h, text, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT,
        italic=False, space=3, anchor=MSO_ANCHOR.TOP, line=None):
    tb = s.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    lines = text.split("\n") if isinstance(text, str) else text
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space)
        if line: p.line_spacing = line
        r = p.add_run(); r.text = ln
        r.font.name = "Arial"; r.font.size = Pt(size); r.font.bold = bold
        r.font.italic = italic; r.font.color.rgb = color
    return tb

def header(s, speaker, title, sub=None):
    txt(s, 0.75, 0.42, 10, 0.25, speaker.upper(), 10, True, MUTE)
    txt(s, 0.75, 0.72, 11.8, 0.6, title, 30, True, INK)
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, In(0.75), In(1.42), In(1.1), In(0.055))
    bar.fill.solid(); bar.fill.fore_color.rgb = ACC; bar.line.fill.background(); bar.shadow.inherit=False
    if sub:
        txt(s, 0.75, 1.62, 11.8, 0.4, sub, 15, False, MUTE)
    return 2.15 if sub else 1.85

def box(s, x, y, w, h, fill=WHITE, border=LINE, radius=False):
    shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
                             In(x), In(y), In(w), In(h))
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if border is None: shp.line.fill.background()
    else:
        shp.line.color.rgb = border; shp.line.width = Pt(1)
    shp.shadow.inherit = False
    if radius:
        try: shp.adjustments[0] = 0.06
        except Exception: pass
    return shp

def arrow(s, x, y, w=0.42, color=MUTE):
    a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, In(x), In(y), In(w), In(0.22))
    a.fill.solid(); a.fill.fore_color.rgb = color; a.line.fill.background(); a.shadow.inherit=False
    return a

def bullets(s, x, y, w, items, size=14, gap=0.34, color=INK, bullet="—"):
    for i, it in enumerate(items):
        txt(s, x, y + i*gap, 0.25, 0.3, bullet, size, True, ACC)
        txt(s, x+0.32, y + i*gap, w-0.32, 0.3, it, size, False, color)

def picture(s, name, x, y, w=None, h=None, border=True):
    path = os.path.join(S, name)
    iw, ih = Image.open(path).size
    ar = ih / iw
    if w and not h: h = w * ar
    if h and not w: w = h / ar
    pic = s.shapes.add_picture(path, In(x), In(y), In(w), In(h))
    if border:
        b = box(s, x, y, w, h, fill=None, border=LINE)
    return pic

def crop_pic(s, name, x, y, w, h, top=0.0, bottom=0.0):
    """Place an image cropped vertically, scaled to fill the given w/h."""
    path = os.path.join(S, name)
    pic = s.shapes.add_picture(path, In(x), In(y), In(w), In(h))
    pic.crop_top = top; pic.crop_bottom = bottom
    box(s, x, y, w, h, fill=None, border=LINE)
    return pic

def caption(s, x, y, w, text):
    txt(s, x, y, w, 0.3, text, 11, False, MUTE, italic=True)

def note(s, text, color=MUTE):
    txt(s, 0.75, 6.85, 11.8, 0.35, text, 11.5, False, color)

# ══════════════════════════════════════════ 1 — TITLE
s = slide()
box(s, 0, 0, W, 7.5, fill=BLACK, border=None)
txt(s, 1.1, 2.35, 11, 0.9, "ChainID Vault", 54, True, WHITE)
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, In(1.1), In(3.42), In(1.6), In(0.07))
bar.fill.solid(); bar.fill.fore_color.rgb = ACC; bar.line.fill.background(); bar.shadow.inherit=False
txt(s, 1.1, 3.75, 10.5, 0.5, "Identity, access and asset custody enforced by smart contracts —\nnot by a database an administrator can edit.", 19, False, RGBColor(0xD6,0xD3,0xCD), line=1.35)
txt(s, 1.1, 5.35, 11, 0.3, "SIH26125  ·  Bharat Electronics Limited  ·  Blockchain & Cybersecurity", 13, True, ACC)
txt(s, 1.1, 5.75, 11, 0.3, "Smart India Hackathon 2026   |   Working prototype — 45 contract tests passing", 12.5, False, RGBColor(0xA3,0xA0,0x99))

# ══════════════════════════════════════════ 2 — THE PROBLEM
s = slide()
y = header(s, "Speaker 1 · The Problem", "Every control ends at the database",
           "Identity, permissions and custody all resolve to rows somebody can write to.")
box(s, 0.75, y+0.05, 5.6, 3.5, fill=SOFT, border=LINE)
txt(s, 1.05, y+0.3, 5.0, 0.3, "HOW IT WORKS TODAY", 11, True, MUTE)
for i, (t, d) in enumerate([
    ("Corporate IAM", "Who exists, and what they may do"),
    ("Asset register", "Which item is issued to whom"),
    ("Audit log", "A table recording the two above"),
]):
    yy = y+0.72+i*0.85
    box(s, 1.05, yy, 5.0, 0.68, fill=WHITE, border=LINE)
    txt(s, 1.25, yy+0.11, 4.6, 0.25, t, 14, True, INK)
    txt(s, 1.25, yy+0.37, 4.6, 0.22, d, 11.5, False, MUTE)
box(s, 6.75, y+0.05, 5.85, 3.5, fill=REDBG, border=RED)
txt(s, 7.05, y+0.3, 5.2, 0.3, "THE SINGLE FAILURE POINT", 11, True, RED)
txt(s, 7.05, y+0.68, 5.25, 1.0,
    "All three are rows in a database.\nAnyone who can write to it can grant a role,\nreassign an asset, and delete the log entry\nthat would have shown they did.", 15, True, INK, line=1.3)
bullets(s, 7.05, y+2.05, 5.2, [
    "A compromised administrator account",
    "An insider with legitimate access",
    "An attacker who reached the database",
], 12.5, 0.32, INK)
txt(s, 0.75, y+3.8, 11.8, 0.4,
    "The audit trail is stored by the very system it is supposed to hold accountable.", 17, True, RED)
note(s, "This is not a software-quality problem. Better code does not change where the enforcement lives.")

# ══════════════════════════════════════════ 3 — THE INCIDENT
s = slide()
y = header(s, "Speaker 1 · A Real Incident", "The contractor who never left the system",
           "A defence facility, an ending engagement, and a piece of controlled equipment.")
steps = [
    ("Day 1", "Contractor onboarded", "Directory account created,\nrow added to the register", None),
    ("Day 40", "Equipment issued", "Spectrum analyser logged\nagainst their name", None),
    ("Last day", "Account disabled", "IAM access removed —\nbut the register is untouched", "warn"),
    ("Day 54", "Equipment presented", "At another plant, with\naltered custody paperwork", "bad"),
    ("Result", "Accepted", "Nothing available to the\nreceiving officer says otherwise", "bad"),
]
x = 0.75
for i, (when, what, detail, tone) in enumerate(steps):
    fill = REDBG if tone == "bad" else (RGBColor(0xFD,0xF3,0xE0) if tone=="warn" else WHITE)
    bd = RED if tone == "bad" else (RGBColor(0xD8,0x9A,0x2E) if tone=="warn" else LINE)
    box(s, x, y+0.15, 2.15, 2.5, fill=fill, border=bd)
    txt(s, x+0.18, y+0.33, 1.8, 0.22, when.upper(), 10, True, ACC if tone is None else bd)
    txt(s, x+0.18, y+0.62, 1.85, 0.5, what, 13.5, True, INK)
    txt(s, x+0.18, y+1.22, 1.85, 1.1, detail, 11, False, MUTE, line=1.25)
    if i < 4: arrow(s, x+2.24, y+1.3, 0.32)
    x += 2.5
box(s, 0.75, y+2.95, 11.85, 1.05, fill=SOFT, border=LINE)
txt(s, 1.05, y+3.14, 11.3, 0.7,
    "Three separate records disagreed, and every one of them was editable by whoever held the credentials.\nThe receiving officer had no independent way to check any of it.", 15, False, INK, line=1.3)
note(s, "Offboarding is where custody systems fail, because disabling access and returning assets are two different systems.")

# ══════════════════════════════════════════ 4 — TRUST BOUNDARY
s = slide()
y = header(s, "Speaker 1 · Why It Cannot Be Patched", "The people who need the evidence are outside your walls",
           "A record is only useful to someone who does not already trust the operator.")
box(s, 0.75, y+0.15, 5.5, 3.6, fill=WHITE, border=LINE)
txt(s, 1.0, y+0.42, 5.0, 0.3, "INSIDE THE TRUST BOUNDARY", 11, True, MUTE)
txt(s, 1.0, y+0.78, 5.0, 0.4, "\"Our database says so.\"", 20, True, INK)
bullets(s, 1.0, y+1.42, 5.0, [
    "Works for staff who already trust IT",
    "Works while nobody disputes anything",
    "Fails the moment it is challenged",
], 13, 0.36)
box(s, 6.85, y+0.15, 5.75, 3.6, fill=GRNBG, border=GRN)
txt(s, 7.1, y+0.42, 5.2, 0.3, "OUTSIDE IT — WHO ACTUALLY NEEDS PROOF", 11, True, GRN)
for i, (who, why) in enumerate([
    ("Internal auditor", "Must not depend on the operator's own copy"),
    ("Receiving officer, another site", "Has no access to your register"),
    ("Customer accepting delivery", "Wants provenance, not assurances"),
    ("Investigator after an incident", "Needs a record nobody could edit"),
]):
    yy = y+0.85+i*0.68
    txt(s, 7.1, yy, 5.2, 0.25, who, 13.5, True, INK)
    txt(s, 7.1, yy+0.26, 5.2, 0.25, why, 11.5, False, MUTE)
txt(s, 0.75, y+4.0, 11.85, 0.4,
    "For everyone on the right, an editable database is an assertion. It is not evidence.", 17, True, INK)
note(s, "This is the gap the problem statement describes, and it is a trust problem rather than a technology problem.")

# ══════════════════════════════════════════ 5 — WHAT IT IS
s = slide()
y = header(s, "Speaker 2 · The Solution", "Three things, governed on-chain",
           "ChainID Vault moves the enforcement point out of application code and into contract code.")
ent = [
    ("IDENTITY", "A recognised keypair", [
        "Lifecycle status: Active / Suspended / Revoked",
        "Hash of an off-chain personnel record",
        "Control proven by signature, never asserted",
    ], BLU),
    ("ASSET", "One controlled item", [
        "ERC-721 token — unique, non-duplicable",
        "Bound to a verified identity at all times",
        "Hash of its custody document anchored",
    ], GRN),
    ("ROLE", "A permission grant", [
        "Admin · Manager · Auditor · User",
        "Checked inside the function it guards",
        "Held per identity, per contract",
    ], RGBColor(0xC9,0x8A,0x2E)),
]
x = 0.75
for name, sub, items, col in ent:
    box(s, x, y+0.15, 3.85, 3.75, fill=WHITE, border=LINE)
    tag = box(s, x, y+0.15, 3.85, 0.1, fill=col, border=None)
    txt(s, x+0.28, y+0.45, 3.3, 0.3, name, 12, True, col)
    txt(s, x+0.28, y+0.78, 3.3, 0.35, sub, 17, True, INK)
    for i, it in enumerate(items):
        txt(s, x+0.28, y+1.35+i*0.66, 0.18, 0.3, "•", 13, True, col)
        txt(s, x+0.52, y+1.35+i*0.66, 3.1, 0.6, it, 12, False, MUTE, line=1.25)
    x += 4.05
box(s, 0.75, y+4.1, 11.85, 0.72, fill=BLACK, border=None)
txt(s, 1.05, y+4.28, 11.3, 0.4,
    "Ownership is not a claim in our system. It is a state a contract will only change if its rules allow it.",
    15, True, WHITE)
note(s, "Everything above is implemented and covered by tests. Nothing on this slide is planned work.")

# ══════════════════════════════════════════ 6 — ARCHITECTURE
s = slide()
y = header(s, "Speaker 2 · Architecture", "No backend. No database. On purpose.",
           "The browser calls the chain directly — the component we removed is the one that fails.")
box(s, 0.9, y+0.25, 3.0, 1.5, fill=WHITE, border=LINE)
txt(s, 1.1, y+0.5, 2.6, 0.3, "BROWSER", 10.5, True, MUTE)
txt(s, 1.1, y+0.8, 2.6, 0.3, "React + ethers.js", 15, True, INK)
txt(s, 1.1, y+1.15, 2.6, 0.4, "Six screens. Holds no\nauthority whatsoever.", 11, False, MUTE, line=1.2)
arrow(s, 4.05, y+0.9, 0.7, INK)
txt(s, 3.95, y+1.18, 0.95, 0.25, "JSON-RPC", 9.5, True, MUTE, PP_ALIGN.CENTER)
box(s, 4.95, y+0.15, 3.5, 1.7, fill=BLACK, border=None)
txt(s, 5.2, y+0.4, 3.0, 0.3, "PERMISSIONED CHAIN", 10.5, True, ACC)
txt(s, 5.2, y+0.72, 3.0, 0.3, "IdentityRegistry", 14, True, WHITE)
txt(s, 5.2, y+1.05, 3.0, 0.3, "AssetNFT", 14, True, WHITE)
txt(s, 5.2, y+1.42, 3.0, 0.3, "All authority lives here", 10.5, False, RGBColor(0xA3,0xA0,0x99))
arrow(s, 8.6, y+0.9, 0.7, INK)
box(s, 9.5, y+0.25, 3.1, 1.5, fill=SOFT, border=LINE)
txt(s, 9.72, y+0.5, 2.7, 0.3, "ANY VERIFIER", 10.5, True, MUTE)
txt(s, 9.72, y+0.8, 2.7, 0.3, "No account needed", 15, True, INK)
txt(s, 9.72, y+1.15, 2.7, 0.4, "Reads the same record\nwithout trusting us.", 11, False, MUTE, line=1.2)
box(s, 0.9, y+2.15, 11.7, 1.65, fill=REDBG, border=RED)
txt(s, 1.2, y+2.35, 11.2, 0.3, "WHAT IS DELIBERATELY ABSENT", 11, True, RED)
absent = [("No backend server", "Nothing to compromise between user and chain"),
          ("No database", "No editable row for a role, an owner or a log"),
          ("No public network", "Runs on a permissioned chain — no gas, no exposure")]
xx = 1.2
for t, d in absent:
    txt(s, xx, y+2.7, 3.7, 0.3, t, 14, True, INK)
    txt(s, xx, y+3.0, 3.6, 0.5, d, 11.5, False, MUTE, line=1.25)
    xx += 3.85
note(s, "A database would only reintroduce the component whose editability this project exists to remove.")

# ══════════════════════════════════════════ 7 — DATA CLASSIFICATION
s = slide()
y = header(s, "Speaker 2 · Data Design", "What goes on-chain, and what must never",
           "A blockchain is permanent and public. That makes it the wrong home for personal data.")
cols = [
    ("ON-CHAIN", GRN, GRNBG, "Small, consensus-critical, must be tamper-evident", [
        "Identity existence and lifecycle status",
        "Role grants and revocations",
        "Asset ownership",
        "Every state-change event",
        "Document fingerprints (hashes)",
    ]),
    ("OFF-CHAIN", BLU, RGBColor(0xEA,0xF3,0xFB), "Sensitive, large, sometimes legally erasable", [
        "Personnel records and personal data",
        "Equipment specification sheets",
        "Signed custody paperwork",
        "Calibration certificates",
        "Anything a person could be identified by",
    ]),
    ("ANCHORED", RGBColor(0xC9,0x8A,0x2E), RGBColor(0xFD,0xF3,0xE0), "The bridge: proof without exposure", [
        "keccak256 of the off-chain document",
        "Chain never sees the contents",
        "Anyone can prove a document is the",
        "one registered — change one byte",
        "and verification fails",
    ]),
]
x = 0.75
for name, col, bg, sub, items in cols:
    box(s, x, y+0.15, 3.85, 4.15, fill=bg, border=col)
    txt(s, x+0.28, y+0.42, 3.3, 0.3, name, 13, True, col)
    txt(s, x+0.28, y+0.78, 3.3, 0.55, sub, 11.5, True, MUTE, line=1.25)
    for i, it in enumerate(items):
        txt(s, x+0.28, y+1.5+i*0.5, 3.35, 0.45, "· " + it, 12, False, INK, line=1.2)
    x += 4.05
note(s, "Privacy by construction: personal data stays erasable off-chain, while its integrity remains provable on-chain.")

# ══════════════════════════════════════════ 8 — CONTRACTS
s = slide()
y = header(s, "Speaker 2 · The Contracts", "Two contracts, one chokepoint",
           "Every rule is enforced where it cannot be bypassed by calling a different function.")
box(s, 0.75, y+0.15, 5.8, 2.5, fill=WHITE, border=LINE)
txt(s, 1.05, y+0.4, 5.2, 0.3, "IdentityRegistry.sol", 17, True, INK)
bullets(s, 1.05, y+0.85, 5.2, [
    "registerIdentity — admin only",
    "suspend / reactivate / revokeIdentity",
    "rotateKey — recover from key loss",
    "proveControl — EIP-712 signature check",
    "Paginated reads for scale",
], 12, 0.33)
box(s, 6.8, y+0.15, 5.8, 2.5, fill=WHITE, border=LINE)
txt(s, 7.1, y+0.4, 5.2, 0.3, "AssetNFT.sol", 17, True, INK)
bullets(s, 7.1, y+0.85, 5.2, [
    "mintAsset — admin only, active recipient",
    "transferAsset — owner, admin or manager",
    "verifyAsset — open to anyone",
    "verifyAssetIntegrity — tamper detection",
    "Calls the registry before every movement",
], 12, 0.33)
box(s, 0.75, y+2.85, 11.85, 1.5, fill=BLACK, border=None)
txt(s, 1.05, y+3.05, 11.3, 0.3, "THE INVARIANT", 11, True, ACC)
txt(s, 1.05, y+3.38, 11.3, 0.35, "An asset may only ever be held by an active identity.", 19, True, WHITE)
txt(s, 1.05, y+3.78, 11.3, 0.4,
    "Enforced inside _update — the one internal function every mint, transfer and burn passes through.", 13, False, RGBColor(0xD6,0xD3,0xCD))
note(s, "45 automated tests cover these, including the negative cases: replay, impersonation, expiry and tampering.")

# ══════════════════════════════════════════ 9 — PIPELINE SCREENSHOT
s = slide()
y = header(s, "Speaker 3 · What We Built", "The workflow, not a pile of screens",
           "The product opens on the actual custody process, each stage runnable live.")
crop_pic(s, "01-pipeline-start.png", 0.75, y+0.1, 7.6, 4.3, top=0.0, bottom=0.40)
box(s, 8.6, y+0.1, 4.0, 4.3, fill=SOFT, border=LINE)
txt(s, 8.85, y+0.35, 3.5, 0.3, "SIX STAGES", 11, True, MUTE)
for i, st in enumerate(["Onboard the contractor","Issue controlled equipment",
                        "Prove identity at the gate","Verify item and paperwork",
                        "Engagement ends — offboard","Issue to them anyway → refused"]):
    col = RED if i == 5 else INK
    txt(s, 8.85, y+0.72+i*0.50, 0.3, 0.3, f"0{i+1}", 11, True, ACC)
    txt(s, 9.25, y+0.72+i*0.50, 3.1, 0.45, st, 12.5, i==5, col, line=1.15)
txt(s, 8.85, y+3.82, 3.5, 0.5, "Each stage states how it is done today\nand what that leaves open.", 10.5, False, MUTE, line=1.2)
note(s, "Screenshot from the running prototype. Every button on it sends a real transaction.")

# ══════════════════════════════════════════ 10 — ADMIN + IDENTITIES
s = slide()
y = header(s, "Speaker 3 · Operations", "Issuing, governing and revoking",
           "Day-to-day tools for the security administrator and the stores desk.")
crop_pic(s, "02-admin.png", 0.75, y+0.1, 5.85, 3.3, bottom=0.34)
caption(s, 0.75, y+3.48, 5.85, "Admin — register an identity, assign a role, issue equipment")
crop_pic(s, "03-identities.png", 6.75, y+0.1, 5.85, 3.3, bottom=0.34)
caption(s, 6.75, y+3.48, 5.85, "Identities — lifecycle control and cryptographic proof of control")
box(s, 0.75, y+3.95, 11.85, 0.85, fill=GRNBG, border=GRN)
txt(s, 1.05, y+4.12, 11.3, 0.5,
    "Suspending or revoking takes effect on-chain immediately. A non-active identity cannot receive an asset\nby any route, and cannot prove control.", 13.5, False, INK, line=1.3)
note(s, "Role badges are read from the chain, not from application state.")

# ══════════════════════════════════════════ 11 — VERIFY
s = slide()
y = header(s, "Speaker 3 · Verification", "The screen that needs no login",
           "A gate officer checks the item and the paperwork against the chain itself.")
crop_pic(s, "06-verify-authentic.png", 0.75, y+0.1, 5.85, 3.5, bottom=0.28)
caption(s, 0.75, y+3.68, 5.85, "Original custody document — verified authentic")
crop_pic(s, "07-verify-tampered.png", 6.75, y+0.1, 5.85, 3.5, bottom=0.28)
caption(s, 6.75, y+3.68, 5.85, "One word changed: RESTRICTED → UNCLASSIFIED — rejected")
box(s, 0.75, y+4.1, 11.85, 0.72, fill=REDBG, border=RED)
txt(s, 1.05, y+4.27, 11.3, 0.4,
    "Nobody decided the second document was fake. Two hashes differ. That is arithmetic, not judgement.", 14.5, True, RED)
note(s, "The document itself was never stored on-chain — only its fingerprint, so nothing sensitive was published.")

# ══════════════════════════════════════════ 12 — AUDIT
s = slide()
y = header(s, "Speaker 3 · The Audit Trail", "The log is the chain, not a table",
           "Live, append-only, and reconstructable by anyone with read access.")
crop_pic(s, "04-audit.png", 0.75, y+0.1, 7.4, 3.9, bottom=0.30)
box(s, 8.45, y+0.1, 4.15, 3.9, fill=SOFT, border=LINE)
txt(s, 8.7, y+0.35, 3.6, 0.3, "WHAT IS RECORDED", 11, True, MUTE)
for i, it in enumerate(["Identity registered","Status changed","Role granted / revoked",
                        "Asset issued","Asset transferred","Control proven"]):
    txt(s, 8.7, y+0.72+i*0.36, 3.6, 0.3, "· " + it, 12, False, INK)
txt(s, 8.7, y+2.95, 3.65, 0.85,
    "And what is NOT there:\nrejected attempts. A reverted\ntransaction rolls back its own\nevents — nothing happened.", 12, True, RED, line=1.28)
note(s, "Say this before a judge asks it. Expecting a 'rejected' row and not finding one is the usual confusion.")

# ══════════════════════════════════════════ 13 — THE AUDIT WE RAN
s = slide()
y = header(s, "Speaker 4 · Security", "We attacked our own system, and it broke",
           "A security review of our contracts found a working exploit. Here is what and how.")
box(s, 0.75, y+0.15, 5.8, 2.15, fill=REDBG, border=RED)
txt(s, 1.05, y+0.38, 5.2, 0.3, "BEFORE", 11, True, RED)
txt(s, 1.05, y+0.72, 5.25, 1.3,
    "The rule \"assets only go to registered identities\"\nlived in one function. But the contract inherits\nthe ERC-721 standard, which brings its own public\ntransfer functions — and those never checked.", 12.5, False, INK, line=1.3)
box(s, 6.8, y+0.15, 5.8, 2.15, fill=REDBG, border=RED)
txt(s, 7.1, y+0.38, 5.2, 0.3, "WORSE", 11, True, RED)
txt(s, 7.1, y+0.72, 5.25, 1.3,
    "That escape emitted no audit event, and the trail\nfilters raw token events by design. The asset left\nthe system and the log showed nothing at all —\nan audit trail that omits events is worse than none.", 12.5, False, INK, line=1.3)
box(s, 0.75, y+2.55, 11.85, 1.85, fill=GRNBG, border=GRN)
txt(s, 1.05, y+2.78, 11.3, 0.3, "AFTER", 11, True, GRN)
txt(s, 1.05, y+3.12, 11.3, 0.35, "The check moved to _update — the single chokepoint every transfer passes through.", 16, True, INK)
txt(s, 1.05, y+3.55, 11.3, 0.7,
    "No entry point can miss it, including any added later. The audit event is emitted from the same place, so no\nownership change can be silent. Three probes that previously succeeded as exploits are now regression tests.", 12.5, False, INK, line=1.3)
note(s, "The lesson worth saying out loud: a rule enforced at every entry point separately is one you will eventually forget to enforce.")

# ══════════════════════════════════════════ 14 — FOUR REFUSALS
s = slide()
y = header(s, "Speaker 4 · Enforcement", "Four refusals, four different mechanisms",
           "A system that only demonstrates success has demonstrated nothing.")
ref = [
    ("Non-admin cannot issue", "Role check", "AccessControl on AssetNFT"),
    ("Non-admin cannot suspend", "Role check", "A different contract, same guard"),
    ("Suspended identity cannot receive", "Lifecycle", "Status enforced at the chokepoint"),
    ("Tampered document fails", "Cryptography", "Hash mismatch — no judgement involved"),
]
x = 0.75
for t, kind, how in ref:
    box(s, x, y+0.15, 2.85, 2.35, fill=WHITE, border=RED)
    circ = s.shapes.add_shape(MSO_SHAPE.OVAL, In(x+0.25), In(y+0.4), In(0.42), In(0.42))
    circ.fill.solid(); circ.fill.fore_color.rgb = REDBG; circ.line.color.rgb = RED; circ.shadow.inherit=False
    txt(s, x+0.25, y+0.46, 0.42, 0.3, "✕", 15, True, RED, PP_ALIGN.CENTER)
    txt(s, x+0.25, y+1.0, 2.4, 0.6, t, 14, True, INK, line=1.2)
    txt(s, x+0.25, y+1.72, 2.4, 0.25, kind.upper(), 10, True, ACC)
    txt(s, x+0.25, y+1.98, 2.4, 0.4, how, 10.5, False, MUTE, line=1.2)
    x += 2.98
crop_pic(s, "08-rejection.png", 0.75, y+2.72, 7.4, 1.78, bottom=0.55)
box(s, 8.35, y+2.72, 4.25, 1.78, fill=BLACK, border=None)
txt(s, 8.6, y+2.94, 3.8, 1.4,
    "The rejection is shown on screen with the contract's own reason —\nnot hidden in a console, and\nnot invented by the interface.", 13, False, WHITE, line=1.32)
note(s, "")

# ══════════════════════════════════════════ 15 — PROOF
s = slide()
y = header(s, "Speaker 4 · Proof", "\"That red banner could be an if-statement\"",
           "A fair objection. So we answer it with the application switched off.")
box(s, 0.75, y+0.15, 11.85, 3.5, fill=BLACK, border=None)
txt(s, 1.05, y+0.4, 11.3, 0.3, "$ npx hardhat run scripts/prove-it.ts --network localhost", 13, True, ACC)
term = [
    ("  2. Contractor tries to issue equipment, bypassing the UI completely", RGBColor(0xD6,0xD3,0xCD), True),
    ("     ✓ REFUSED BY THE CONTRACT — AccessControlUnauthorizedAccount(0x90F7…b906, 0xa498…1775)", GRN, False),
    ("  4. An asset cannot escape to an address the organisation never registered", RGBColor(0xD6,0xD3,0xCD), True),
    ("     ✓ REFUSED — Recipient not an active identity   (raw ERC-721 transfer path)", GRN, False),
    ("  5. A revoked identity is finished — even for the admin", RGBColor(0xD6,0xD3,0xCD), True),
    ("     ✓ Even the ADMIN cannot issue to a revoked identity", GRN, False),
    ("  6. Tampered paperwork fails, and it fails on arithmetic", RGBColor(0xD6,0xD3,0xCD), True),
    ("     original document -> AUTHENTIC     one word changed -> REJECTED", GRN, False),
]
for i, (line_, col, bold) in enumerate(term):
    tb = txt(s, 1.05, y+0.85+i*0.32, 11.3, 0.28, line_, 11.5, bold, col)
    tb.text_frame.paragraphs[0].runs[0].font.name = "Consolas"
txt(s, 1.05, y+3.42, 11.3, 0.3, "Every refusal came from contract bytecode. The web app was never running.", 13, True, ACC)
box(s, 0.75, y+3.85, 11.85, 0.85, fill=SOFT, border=LINE)
txt(s, 1.05, y+4.02, 11.3, 0.5,
    "The strongest line is number 5. The account that is refused holds every administrative privilege in the system.\nA database administrator can always override the database. Here, nobody can.", 13.5, True, INK, line=1.3)
note(s, "")

# ══════════════════════════════════════════ 16 — TESTING
s = slide()
y = header(s, "Speaker 4 · Assurance", "What we can actually evidence",
           "Claims are cheap. These are the numbers behind them.")
stats = [("45", "contract tests\npassing"), ("3", "exploits found\nand closed"),
         ("4", "distinct on-chain\nrefusals"), ("0", "console errors\nin the demo path")]
x = 0.75
for n, lab in stats:
    box(s, x, y+0.15, 2.85, 1.65, fill=WHITE, border=LINE)
    txt(s, x, y+0.35, 2.85, 0.65, n, 42, True, INK, PP_ALIGN.CENTER)
    txt(s, x, y+1.12, 2.85, 0.5, lab, 11.5, False, MUTE, PP_ALIGN.CENTER, line=1.2)
    x += 2.98
txt(s, 0.75, y+2.1, 11.85, 0.3, "Negative tests — the ones that matter", 16, True, INK)
neg = [
    ("Signature replay", "A used proof cannot be presented twice"),
    ("Impersonation", "Another key's signature does not prove control"),
    ("Expired challenge", "A proof past its deadline is refused"),
    ("Revoked identity", "Cannot prove control, cannot receive assets"),
    ("Unregistered recipient", "Blocked on every transfer path, including raw ERC-721"),
    ("Document tampering", "A single altered byte fails integrity verification"),
]
for i, (t, d) in enumerate(neg):
    xx = 0.75 + (i % 2) * 6.05
    yy = y + 2.55 + (i // 2) * 0.72
    box(s, xx, yy, 5.8, 0.62, fill=SOFT, border=None)
    txt(s, xx+0.22, yy+0.09, 2.3, 0.25, t, 12.5, True, INK)
    txt(s, xx+2.55, yy+0.11, 3.1, 0.4, d, 11, False, MUTE, line=1.2)
note(s, "Threat model, requirement traceability and the full audit are committed in the repository.")

# ══════════════════════════════════════════ 17 — IMPACT
s = slide()
y = header(s, "Speaker 5 · Impact", "Who this changes the day for",
           "Four roles, four different problems solved by the same record.")
imp = [
    ("Security administrator", "Revocation is immediate and cannot be bypassed — including by them.", BLU),
    ("Stores / custody officer", "One verifiable record instead of a register and paperwork that disagree.", GRN),
    ("Internal auditor", "Reconstructs the full history without trusting the system operator.", RGBColor(0xC9,0x8A,0x2E)),
    ("External verifier", "Confirms authenticity and custody with no account and no login.", INK),
]
for i, (who, what, col) in enumerate(imp):
    yy = y + 0.2 + i*0.95
    bar = box(s, 0.75, yy, 0.09, 0.78, fill=col, border=None)
    txt(s, 1.05, yy+0.05, 4.0, 0.3, who, 16, True, INK)
    txt(s, 5.2, yy+0.1, 7.4, 0.55, what, 13.5, False, MUTE, line=1.25)
box(s, 0.75, y+4.15, 11.85, 0.85, fill=BLACK, border=None)
txt(s, 1.05, y+4.32, 11.3, 0.5,
    "Operationally, the win is offboarding: the gap that opens every time somebody leaves, and closes here the moment\ntheir identity is revoked.", 14, False, WHITE, line=1.3)
note(s, "")

# ══════════════════════════════════════════ 18 — BUILT VS NEXT
s = slide()
y = header(s, "Speaker 5 · Honest Status", "What is built, and what is not",
           "We would rather tell you the boundary than have you find it.")
box(s, 0.75, y+0.15, 5.8, 4.2, fill=GRNBG, border=GRN)
txt(s, 1.05, y+0.4, 5.2, 0.3, "BUILT, TESTED AND DEMONSTRABLE", 11, True, GRN)
for i, it in enumerate([
    "Identity registration and lifecycle",
    "Suspension, revocation, key rotation",
    "Role-based access, enforced on-chain",
    "ERC-721 asset custody with identity binding",
    "EIP-712 cryptographic proof of control",
    "Asset verification and document integrity",
    "Live audit trail from chain events",
    "Six-stage custody pipeline, end to end",
]):
    txt(s, 1.05, y+0.8+i*0.42, 0.25, 0.3, "✓", 13, True, GRN)
    txt(s, 1.38, y+0.8+i*0.42, 4.9, 0.35, it, 12.5, False, INK)
box(s, 6.8, y+0.15, 5.8, 4.2, fill=SOFT, border=LINE)
txt(s, 7.1, y+0.4, 5.2, 0.3, "NOT BUILT — AND WHY", 11, True, MUTE)
for i, (it, why) in enumerate([
    ("Wallet authentication", "Demo uses local keys; production needs wallet-connect"),
    ("Multi-signature admin", "One key holds full authority today"),
    ("W3C DID documents", "Identity formatting, layered on a correct permission system"),
    ("Off-chain document store", "We anchor hashes; production needs the store itself"),
    ("Failed-attempt logging", "A revert rolls back its own events by design"),
    ("Permissioned chain deploy", "Local node chosen for demo reliability"),
]):
    yy = y+0.8+i*0.62
    txt(s, 7.1, yy, 5.2, 0.25, it, 12.5, True, INK)
    txt(s, 7.1, yy+0.24, 5.2, 0.3, why, 10.5, False, MUTE, line=1.15)
note(s, "Everything on the right is sequenced in the roadmap, not discovered late.")

# ══════════════════════════════════════════ 19 — FEASIBILITY
s = slide()
y = header(s, "Speaker 5 · Path to Production", "From this prototype to a deployable system",
           "Nothing here requires new research — only engineering already scoped.")
phases = [
    ("NOW", "Working prototype", ["Two contracts, 45 tests","Full workflow interface","Local permissioned chain"], GRN),
    ("NEXT", "Pilot-ready", ["Wallet authentication","Multi-signature admin","Off-chain document store"], BLU),
    ("THEN", "Deployed", ["Hyperledger Besu / Quorum","Event indexer for scale","Integration with existing register"], RGBColor(0xC9,0x8A,0x2E)),
    ("LATER", "Extended", ["W3C DID / verifiable credentials","Tamper-evident physical tagging","Cross-site federation"], MUTE),
]
x = 0.75
for i, (when, what, items, col) in enumerate(phases):
    box(s, x, y+0.4, 2.85, 2.9, fill=WHITE, border=col)
    tag = box(s, x, y+0.4, 2.85, 0.4, fill=col, border=None)
    txt(s, x, y+0.47, 2.85, 0.3, when, 12, True, WHITE, PP_ALIGN.CENTER)
    txt(s, x+0.22, y+0.95, 2.4, 0.3, what, 15, True, INK)
    for j, it in enumerate(items):
        txt(s, x+0.22, y+1.4+j*0.55, 2.45, 0.5, "· " + it, 11.5, False, MUTE, line=1.2)
    if i < 3: arrow(s, x+2.9, y+1.75, 0.28)
    x += 3.05
box(s, 0.75, y+3.6, 11.85, 0.95, fill=SOFT, border=LINE)
txt(s, 1.05, y+3.78, 11.3, 0.6,
    "Adoption is incremental. The system can run alongside an existing asset register — writing the same events to a\nrecord nobody can edit — long before it replaces anything.", 13.5, False, INK, line=1.3)
note(s, "")

# ══════════════════════════════════════════ 20 — CLOSE
s = slide()
box(s, 0, 0, W, 7.5, fill=BLACK, border=None)
txt(s, 1.1, 1.3, 11.2, 0.35, "WHY BLOCKCHAIN, IN ONE ANSWER", 12, True, ACC)
txt(s, 1.1, 1.85, 11.2, 1.8,
    "A database could draw every screen\nwe just showed you.", 34, True, WHITE, line=1.22)
txt(s, 1.1, 3.35, 11.2, 1.8,
    "What it cannot do is be trustworthy to\nsomeone who does not trust its operator.", 34, True, ACC, line=1.22)
box(s, 1.1, 5.15, 11.1, 0.055, fill=RGBColor(0x46,0x43,0x3E), border=None)
txt(s, 1.1, 5.45, 11.2, 0.9,
    "That is why the verification screen needs no login, why the auditor does not depend on our copy,\nand why the administrator who built the system still cannot override it.", 14.5, False, RGBColor(0xD6,0xD3,0xCD), line=1.35)
txt(s, 1.1, 6.65, 11.2, 0.3, "ChainID Vault  ·  SIH26125  ·  github.com/tohraan/chainid-vault", 12, True, RGBColor(0xA3,0xA0,0x99))

prs.save(OUT)
print("saved", OUT, "slides:", len(prs.slides.__iter__.__self__._sldIdLst))
