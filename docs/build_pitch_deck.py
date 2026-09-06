from pptx import Presentation
from pptx.util import Inches as In, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image
import os

OUT = "/Users/tohraan/Downloads/build/docs/ChainIDVault_Pitch_Deck.pptx"
S   = "/Users/tohraan/Downloads/build/docs/screens"

INK=RGBColor(0x1C,0x1B,0x1A); MUTE=RGBColor(0x6B,0x68,0x62); LINE=RGBColor(0xD6,0xD3,0xCD)
SOFT=RGBColor(0xF2,0xF1,0xEE); ACC=RGBColor(0xFC,0xBD,0x31)
RED=RGBColor(0xBC,0x1C,0x1C); REDBG=RGBColor(0xFD,0xEC,0xEC)
GRN=RGBColor(0x2E,0x9E,0x5B); GRNBG=RGBColor(0xE7,0xF4,0xEC)
BLU=RGBColor(0x3B,0x8F,0xD9); BLUBG=RGBColor(0xEA,0xF3,0xFB)
WHITE=RGBColor(0xFF,0xFF,0xFF); BLACK=RGBColor(0,0,0)

prs = Presentation(); prs.slide_width, prs.slide_height = In(13.333), In(7.5)
BLANK = prs.slide_layouts[6]; W = 13.333

def slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE,0,0,prs.slide_width,prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb=WHITE; bg.line.fill.background(); bg.shadow.inherit=False
    return s

def txt(s,x,y,w,h,text,size=14,bold=False,color=INK,align=PP_ALIGN.LEFT,line=None,
        anchor=MSO_ANCHOR.TOP,italic=False,font="Arial"):
    tb=s.shapes.add_textbox(In(x),In(y),In(w),In(h)); tf=tb.text_frame
    tf.word_wrap=True; tf.vertical_anchor=anchor
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0
    for i,ln in enumerate(text.split("\n")):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=align; p.space_after=Pt(2)
        if line: p.line_spacing=line
        r=p.add_run(); r.text=ln
        r.font.name=font; r.font.size=Pt(size); r.font.bold=bold
        r.font.italic=italic; r.font.color.rgb=color
    return tb

def head(s,speaker,title,sub=None):
    txt(s,0.75,0.42,11,0.25,speaker.upper(),10,True,MUTE)
    txt(s,0.75,0.72,11.9,0.75,title,29,True,INK,line=1.05)
    b=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,In(0.75),In(1.52),In(1.1),In(0.055))
    b.fill.solid(); b.fill.fore_color.rgb=ACC; b.line.fill.background(); b.shadow.inherit=False
    if sub: txt(s,0.75,1.72,11.9,0.4,sub,15,False,MUTE)
    return 2.25 if sub else 1.95

def box(s,x,y,w,h,fill=WHITE,border=LINE):
    sh=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,In(x),In(y),In(w),In(h))
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    if border is None: sh.line.fill.background()
    else: sh.line.color.rgb=border; sh.line.width=Pt(1)
    sh.shadow.inherit=False; return sh

def arrow(s,x,y,w=0.4,h=0.2,color=MUTE,down=False):
    a=s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW if down else MSO_SHAPE.RIGHT_ARROW,
                         In(x),In(y),In(w),In(h))
    a.fill.solid(); a.fill.fore_color.rgb=color; a.line.fill.background(); a.shadow.inherit=False
    return a

def bullets(s,x,y,w,items,size=14,gap=0.36,color=INK):
    for i,it in enumerate(items):
        txt(s,x,y+i*gap,0.22,0.3,"—",size,True,ACC)
        txt(s,x+0.3,y+i*gap,w-0.3,0.35,it,size,False,color,line=1.2)

def pic(s,name,x,y,w,h,top=0.0,bottom=0.0):
    p=s.shapes.add_picture(os.path.join(S,name),In(x),In(y),In(w),In(h))
    p.crop_top=top; p.crop_bottom=bottom
    box(s,x,y,w,h,fill=None,border=LINE); return p

def note(s,t,color=MUTE): txt(s,0.75,6.88,11.9,0.35,t,11.5,False,color)

# ══════════════════ 1 TITLE
s=slide(); box(s,0,0,W,7.5,fill=BLACK,border=None)
txt(s,1.1,2.4,11,0.9,"ChainID Vault",52,True,WHITE)
b=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,In(1.1),In(3.45),In(1.6),In(0.07))
b.fill.solid(); b.fill.fore_color.rgb=ACC; b.line.fill.background(); b.shadow.inherit=False
txt(s,1.1,3.8,10.8,0.6,"Anyone can prove who controls an asset —\nwithout trusting whoever runs the system.",20,False,RGBColor(0xD6,0xD3,0xCD),line=1.3)
txt(s,1.1,5.5,11,0.3,"SIH26125  ·  Bharat Electronics Limited  ·  Blockchain & Cybersecurity",13,True,ACC)
txt(s,1.1,5.9,11,0.3,"Smart India Hackathon 2026",12.5,False,RGBColor(0xA3,0xA0,0x99))

# ══════════════════ 2 THE GATE  (the story — common ground)
s=slide()
y=head(s,"Speaker 1 · Start here","Everyone here has already used this system",
       "A gate. A guard. A card. It works — until it doesn't.")
box(s,0.75,y+0.1,5.6,3.6,fill=SOFT,border=LINE)
txt(s,1.05,y+0.35,5.0,0.3,"AT A UNIVERSITY GATE",11,True,MUTE)
for i,(q,a) in enumerate([("Who are you?","The guard looks at your card."),
                          ("Should you be here?","He checks you against a list."),
                          ("Did anyone record it?","He writes your name in a register.")]):
    yy=y+0.75+i*0.92
    txt(s,1.05,yy,5.0,0.3,q,16,True,INK)
    txt(s,1.05,yy+0.32,5.0,0.3,a,13,False,MUTE)
box(s,6.75,y+0.1,5.85,3.6,fill=REDBG,border=RED)
txt(s,7.05,y+0.35,5.2,0.3,"WHERE IT QUIETLY FAILS",11,True,RED)
for i,(t,d) in enumerate([("The card is not the person",
                           "Borrowed, cloned, or simply held by someone else."),
                          ("He waves through the face he knows",
                           "The rule stops being checked. It becomes memory."),
                          ("The graduate's card still opens the gate",
                           "They left last year. Nobody told the gate."),
                          ("The register is the guard's own notebook",
                           "The record is kept by the person it would hold accountable.")]):
    yy=y+0.72+i*0.72
    txt(s,7.05,yy,5.2,0.28,t,14,True,INK)
    txt(s,7.05,yy+0.28,5.2,0.3,d,11.5,False,MUTE,line=1.15)
txt(s,0.75,y+3.9,11.9,0.4,"Nobody at that gate is doing anything wrong. The system is simply built on trust rather than proof.",17,True,INK)
note(s,"Hold this picture. Every problem in the next ten minutes is this gate, with higher stakes.")

# ══════════════════ 3 SAME GATE, HIGHER STAKES
s=slide()
y=head(s,"Speaker 1 · The real setting","Now the gate is a defence facility",
       "Same three checks. Same failure modes. Consequences that do not stay on campus.")
rows=[("Who are you?","Student ID card","A contractor's credentials"),
      ("Should you be here?","On the guard's list","Cleared for this equipment, today"),
      ("Did anyone record it?","A notebook at the gate","The custody record for controlled equipment"),
      ("What if they left?","Card still opens the gate","Assets still issued in their name")]
box(s,0.75,y+0.1,11.85,0.42,fill=BLACK,border=None)
txt(s,1.0,y+0.19,3.2,0.25,"THE QUESTION",10.5,True,ACC)
txt(s,4.6,y+0.19,3.4,0.25,"AT THE UNIVERSITY",10.5,True,WHITE)
txt(s,8.6,y+0.19,3.8,0.25,"AT A DEFENCE FACILITY",10.5,True,WHITE)
yy=y+0.52
for i,(q,a,c) in enumerate(rows):
    box(s,0.75,yy,11.85,0.72,fill=WHITE if i%2==0 else SOFT,border=LINE)
    txt(s,1.0,yy+0.2,3.4,0.32,q,14.5,True,INK)
    txt(s,4.6,yy+0.22,3.7,0.3,a,12.5,False,MUTE)
    txt(s,8.6,yy+0.22,3.9,0.3,c,12.5,False,RED if i==3 else INK)
    yy+=0.72
box(s,0.75,yy+0.25,11.85,0.95,fill=SOFT,border=LINE)
txt(s,1.05,yy+0.44,11.3,0.6,"The last row is the one that costs money. Access gets removed on someone's last day.\nThe equipment they were holding does not remove itself.",16,True,INK,line=1.28)
note(s,"")

# ══════════════════ 4 THE TRUST PROBLEM
s=slide()
y=head(s,"Speaker 1 · The real problem","The problem is not missing data. It is that no record outranks another.",
       "Three systems, three answers, and no way to settle which one is right.")
labels=[("IDENTITY SYSTEM","says the person is valid"),
        ("ASSET REGISTER","says who holds the item"),
        ("THE PAPERWORK","says something else again")]
x=0.75
for t,d in labels:
    box(s,x,y+0.15,3.7,1.15,fill=WHITE,border=LINE)
    txt(s,x+0.25,y+0.38,3.2,0.25,t,11.5,True,INK)
    txt(s,x+0.25,y+0.68,3.2,0.35,d,12.5,False,MUTE)
    arrow(s,x+1.65,y+1.4,0.35,0.2,MUTE,down=True)
    x+=4.05
box(s,0.75,y+1.75,11.85,0.85,fill=BLACK,border=None)
txt(s,1.05,y+1.95,11.3,0.45,"All three are maintained by the same organisation.",18,True,WHITE)
box(s,0.75,y+2.85,11.85,1.15,fill=REDBG,border=RED)
txt(s,1.05,y+3.08,11.3,0.75,"And the log that would show a record was altered is stored by the same system that would have altered it.\nWhen the party who creates the record also controls it, nobody outside can verify anything.",16,True,RED,line=1.32)
note(s,"This is the sentence the whole pitch turns on. Say it slowly.")

# ══════════════════ 5 THE NUMBER
s=slide()
y=head(s,"Speaker 2 · The stakes","₹1,237 crore of stores nobody could reconcile")
txt(s,0.75,y+0.15,7.4,1.4,"₹1,237 crore",76,True,RED)
txt(s,0.75,y+1.6,7.4,0.8,"of the Ordnance Factory Board's stores were non-active —\nnot moving, surplus, or obsolete. Out of ₹6,172 crore held.",18,False,INK,line=1.3)
txt(s,0.75,y+2.5,7.4,0.3,"CAG Audit Report No. 10 of 2024, Government of India",12,True,MUTE)
box(s,0.75,y+2.95,7.4,0.95,fill=SOFT,border=LINE)
txt(s,1.0,y+3.14,6.9,0.6,"Holding time rose from 214 days of consumption to 344.\nAfter corporatisation, CAG went back: 21% still non-active in 2023.",13.5,False,INK,line=1.3)
box(s,8.45,y+0.15,4.15,3.75,fill=REDBG,border=RED)
txt(s,8.7,y+0.4,3.6,0.3,"WHAT WE ARE NOT SAYING",11,True,RED)
txt(s,8.7,y+0.78,3.65,1.3,"We are not claiming a blockchain\nwould have recovered that money.\nWe cannot prove that, so we will\nnot say it.",13.5,True,INK,line=1.3)
txt(s,8.7,y+2.2,3.6,0.3,"WHAT IT DOES SHOW",11,True,RED)
txt(s,8.7,y+2.58,3.65,1.2,"This is what it looks like when an\norganisation can no longer reconcile\nits own custody records.\n\nThat is a verification problem.",13.5,False,INK,line=1.3)
note(s,"Documented external problem — not a claim about our system.")

# ══════════════════ 6 WHY NOW
s=slide()
y=head(s,"Speaker 2 · Why now","The old approach was given a decade, and the gap did not close",
       "Reorganising the institution did not fix a problem that lives in the records.")
tl=[("2016-17","Stores held 214 days of consumption","ok"),
    ("2020-21","Risen to 344 days. ₹1,237 crore non-active.","bad"),
    ("Oct 2021","OFB corporatised into seven defence PSUs","warn"),
    ("2023","CAG returns. 21% of sampled stores still non-active.","bad")]
x=0.75
for i,(when,what,tone) in enumerate(tl):
    fill=REDBG if tone=="bad" else (RGBColor(0xFD,0xF3,0xE0) if tone=="warn" else WHITE)
    bd=RED if tone=="bad" else (RGBColor(0xB4,0x53,0x09) if tone=="warn" else LINE)
    box(s,x,y+0.2,2.75,1.9,fill=fill,border=bd)
    txt(s,x+0.22,y+0.42,2.3,0.25,when,12,True,bd if tone!="ok" else MUTE)
    txt(s,x+0.22,y+0.78,2.35,1.1,what,13,True,INK,line=1.25)
    if i<3: arrow(s,x+2.82,y+1.05,0.3,0.18)
    x+=3.05
box(s,0.75,y+2.45,11.85,1.05,fill=BLACK,border=None)
txt(s,1.05,y+2.66,11.3,0.65,"More contractors, more sites, more handoffs between separate entities — and the same\nrecords that could not be reconciled before.",17,True,WHITE,line=1.3)
txt(s,0.75,y+3.75,11.85,0.4,"The problem was never the warehouse. It was that no party could prove which record was correct.",16,True,RED)
note(s,"")

# ══════════════════ 7 THREE QUESTIONS
s=slide()
y=head(s,"Speaker 2 · The insight","Every critical action comes down to three questions")
qs=[("WHO ARE YOU?","Identity","Is this a real, currently valid person — not just a card?",BLU),
    ("WHAT ARE YOU ALLOWED TO DO?","Permission","Being known is not the same as being allowed.",RGBColor(0xC9,0x8A,0x2E)),
    ("CAN ANYONE PROVE WHAT HAPPENED?","Proof","Afterwards, can an outsider check it — and see if it changed?",GRN)]
yy=y+0.2
for q,tag,d,col in qs:
    box(s,0.75,yy,11.85,1.32,fill=WHITE,border=col)
    box(s,0.75,yy,0.12,1.32,fill=col,border=None)
    txt(s,1.15,yy+0.22,7.5,0.42,q,26,True,INK)
    txt(s,1.15,yy+0.78,7.5,0.32,d,14,False,MUTE)
    txt(s,9.4,yy+0.42,3.0,0.4,tag,17,True,col,PP_ALIGN.RIGHT)
    yy+=1.48
txt(s,0.75,yy+0.12,11.85,0.4,"Miss any one and the action cannot be trusted. We built ChainID Vault around exactly these three.",17,True,INK)
note(s,"The gate answered all three badly. So does most enterprise software.")

# ══════════════════ 8 WHAT IT IS
s=slide()
y=head(s,"Speaker 3 · The solution","ChainID Vault: verify the identity, enforce the permission, prove the action")
box(s,0.75,y+0.1,11.85,1.15,fill=BLACK,border=None)
txt(s,1.05,y+0.32,11.3,0.7,"Anyone can prove who controls an asset — without trusting whoever runs the system.",21,True,WHITE)
p3=[("VERIFY THE IDENTITY","Not that a record exists — that this person\ncontrols it, and that it is active right now.",BLU),
    ("ENFORCE THE PERMISSION","The rule is applied every time, automatically.\nNobody has to remember to check.",RGBColor(0xC9,0x8A,0x2E)),
    ("PROVE THE ACTION","The record can be checked by someone\noutside the organisation entirely.",GRN)]
x=0.75
for t,d,col in p3:
    box(s,x,y+1.5,3.85,1.9,fill=WHITE,border=LINE)
    box(s,x,y+1.5,3.85,0.1,fill=col,border=None)
    txt(s,x+0.28,y+1.78,3.3,0.3,t,13,True,col)
    txt(s,x+0.28,y+2.18,3.35,1.0,d,13,False,INK,line=1.3)
    x+=4.05
box(s,0.75,y+3.6,11.85,0.62,fill=SOFT,border=LINE)
txt(s,1.05,y+3.76,11.3,0.35,"Notice what we have not mentioned yet: any technology at all.",15,True,MUTE)
note(s,"")

# ══════════════════ 9 THE ACTION FLOW
s=slide()
y=head(s,"Speaker 3 · How it works","What happens the moment somebody acts",
       "The diagram follows the action, not the components.")
steps=[("Someone acts","Issue this equipment\nto this person",WHITE,LINE),
       ("Is the identity active?","Not 'did it ever exist'.\nActive right now.",BLUBG,BLU),
       ("Is this allowed?","Does this identity hold\nthis permission?",RGBColor(0xFD,0xF3,0xE0),RGBColor(0xC9,0x8A,0x2E)),
       ("Refuse or allow","Automatic. Nobody has\nto remember to check.",SOFT,INK),
       ("Record created","A receipt of what\nactually happened.",GRNBG,GRN),
       ("Anyone can check","Including people outside\nthe organisation.",GRNBG,GRN)]
x=0.6
for i,(t,d,f,b) in enumerate(steps):
    box(s,x,y+0.3,1.85,2.0,fill=f,border=b)
    txt(s,x+0.15,y+0.5,1.6,0.6,t,12.5,True,INK,line=1.15)
    txt(s,x+0.15,y+1.18,1.62,0.9,d,10.5,False,MUTE,line=1.2)
    if i<5: arrow(s,x+1.9,y+1.2,0.25,0.16,INK)
    x+=2.1
box(s,0.6,y+2.6,12.15,0.85,fill=REDBG,border=RED)
txt(s,0.9,y+2.78,11.6,0.5,"If either check fails, the action does not happen. Not a warning, not a note in a log for somebody to find later —\nthe action does not happen.",15,True,RED,line=1.3)
box(s,0.6,y+3.62,12.15,0.62,fill=SOFT,border=LINE)
txt(s,0.9,y+3.78,11.6,0.35,"Only the last two steps need anything unusual. That is where our technology choice matters — and nowhere else.",14.5,False,INK)
note(s,"")

prs.save(OUT); print("part 1 done:", len(prs.slides.__iter__.__self__._sldIdLst))

# ══════════════════ 10 WHY BLOCKCHAIN
s=slide()
y=head(s,"Speaker 3 · The technology choice","Blockchain is where we keep the proof, not the files",
       "One job, precisely defined. We are not claiming it is better at everything.")
box(s,0.75,y+0.1,11.85,0.95,fill=SOFT,border=LINE)
txt(s,1.05,y+0.28,11.3,0.6,"A database is excellent at storing and managing information. But for records that must survive a dispute, the\nquestion is different: can the organisation that changes the record also rewrite its history, undetected?",15,True,INK,line=1.3)
cols=[("STAYS WHERE IT ALREADY IS",BLU,BLUBG,
       ["Personnel files","Equipment spec sheets","Custody paperwork","Calibration certificates"],
       "We are not asking anyone to\nmove their documents anywhere."),
      ("THE BRIDGE",RGBColor(0xC9,0x8A,0x2E),RGBColor(0xFD,0xF3,0xE0),
       ["A digital fingerprint","of each document"],
       "Change one character and the\nfingerprint no longer matches."),
      ("ON THE CHAIN",GRN,GRNBG,
       ["Who is a valid identity","What each one may do","Every asset movement","Every status change"],
       "Small, and the only part that\nmust be tamper-evident.")]
x=0.75
for t,col,bg,items,foot in cols:
    box(s,x,y+1.25,3.85,3.0,fill=bg,border=col)
    txt(s,x+0.25,y+1.48,3.4,0.28,t,12,True,col)
    for i,it in enumerate(items):
        txt(s,x+0.25,y+1.88+i*0.34,3.4,0.3,"· "+it,13,False,INK)
    txt(s,x+0.25,y+3.5,3.42,0.6,foot,11.5,True,MUTE,line=1.25)
    x+=4.05
arrow(s,4.68,y+2.6,0.28,0.18,INK); arrow(s,8.73,y+2.6,0.28,0.18,INK)
note(s,"Runs today on a local chain. The deployment target is a permissioned network such as Hyperledger Besu.")

# ══════════════════ 11 DEMO — REFUSE
s=slide()
y=head(s,"Speaker 4 · Demo","Watch the system refuse something it should refuse",
       "The contractor from slide 3. Engagement ended, identity revoked.")
pic(s,"08-rejection.png",0.75,y+0.15,7.5,3.05,bottom=0.45)
box(s,8.5,y+0.15,4.1,3.05,fill=BLACK,border=None)
txt(s,8.78,y+0.4,3.55,0.3,"WHAT JUST HAPPENED",11,True,ACC)
for i,t in enumerate(["An administrator tried to\nissue equipment to them.",
                      "The system refused.",
                      "Not a warning. Not a note\nin a log. It did not happen."]):
    txt(s,8.78,y+0.78+i*0.72,3.55,0.65,t,13.5,i==1,WHITE if i!=1 else ACC,line=1.25)
txt(s,8.78,y+2.95-0.05,3.55,0.3,"",11,True,ACC)
box(s,0.75,y+3.35,11.85,1.0,fill=REDBG,border=RED)
txt(s,1.05,y+3.55,11.3,0.65,"The account that just tried holds every privilege in this system. It created that identity. It issued the original\nequipment. It still cannot do this. A database administrator can always override the database. Here, nobody can.",15,True,RED,line=1.3)
note(s,"Pause here. Let it sit before moving on.")

# ══════════════════ 12 DEMO — ALLOW + PROOF
s=slide()
y=head(s,"Speaker 4 · Demo","Now watch it allow something it should allow",
       "Same action. Active identity, correct permission.")
pic(s,"06-verify-authentic.png",0.75,y+0.15,5.85,2.9,bottom=0.32)
txt(s,0.75,y+3.12,5.85,0.3,"The original custody document — verified",11.5,False,MUTE,italic=True)
pic(s,"07-verify-tampered.png",6.75,y+0.15,5.85,2.9,bottom=0.32)
txt(s,6.75,y+3.12,5.85,0.3,"One word changed: RESTRICTED → UNCLASSIFIED — rejected",11.5,False,MUTE,italic=True)
box(s,0.75,y+3.55,11.85,0.85,fill=SOFT,border=LINE)
txt(s,1.05,y+3.73,11.3,0.5,"Nobody decided the second one was fake. Two fingerprints differ. That is arithmetic, not judgement —\nand this screen has no login, so someone who does not trust us can still run the check.",15,True,INK,line=1.3)
note(s,"One thing absent from the history: the refused attempts. Nothing was allowed to happen, so nothing was recorded.")

# ══════════════════ 13 WE ATTACKED IT
s=slide()
y=head(s,"Speaker 5 · Credibility","We attacked our own system and it broke",
       "A red banner in our own interface proves nothing. So we switched the interface off.")
box(s,0.75,y+0.1,7.0,2.55,fill=BLACK,border=None)
txt(s,1.0,y+0.3,6.5,0.28,"$ npx hardhat run scripts/prove-it.ts",12,True,ACC,font="Consolas")
term=[("  Contractor tries to issue equipment, UI bypassed",RGBColor(0xD6,0xD3,0xCD)),
      ("   REFUSED BY THE CONTRACT",GRN),
      ("  Asset moved to an unregistered address",RGBColor(0xD6,0xD3,0xCD)),
      ("   REFUSED — recipient not an active identity",GRN),
      ("  ADMIN issues to a revoked identity",RGBColor(0xD6,0xD3,0xCD)),
      ("   REFUSED — even for the administrator",GRN)]
for i,(t,c) in enumerate(term):
    txt(s,1.0,y+0.68+i*0.3,6.5,0.26,t,11,i%2==1,c,font="Consolas")
txt(s,1.0,y+2.28,6.5,0.28,"The web app was never running.",11.5,True,ACC,font="Consolas")
stats=[("45","automated tests\npassing"),("3","flaws we found\nin our own code"),("4","kinds of invalid action\nrefused on-chain")]
x=8.05
for n,l in stats:
    box(s,x,y+0.1,1.5,1.2,fill=WHITE,border=LINE)
    txt(s,x,y+0.25,1.5,0.5,n,30,True,INK,PP_ALIGN.CENTER)
    txt(s,x,y+0.8,1.5,0.4,l,9.5,False,MUTE,PP_ALIGN.CENTER,line=1.15)
    x+=1.62
box(s,8.05,y+1.45,4.55,1.2,fill=REDBG,border=RED)
txt(s,8.3,y+1.62,4.1,0.95,"In the worst one, an asset could leave\nthe system entirely — and the audit log\nshowed nothing at all. We fixed it. The\nattacks are now tests that must keep failing.",12,False,INK,line=1.3)
box(s,0.75,y+2.85,11.85,0.9,fill=SOFT,border=LINE)
txt(s,1.05,y+3.05,11.3,0.5,"We did not only test that valid actions work. We tested that invalid ones are stopped —\nreplay, impersonation, expired proofs, revoked identities, tampered documents.",15,True,INK,line=1.3)
note(s,"")

# ══════════════════ 14 WHAT CHANGES
s=slide()
y=head(s,"Speaker 5 · The shift","From trusting records to proving them")
pairs=[("\"The system says this happened.\"","\"The record can be independently checked.\""),
       ("\"An administrator decides whether to allow it.\"","\"The rules enforce themselves.\""),
       ("\"History lives inside one system.\"","\"Critical actions leave a tamper-evident trail.\""),
       ("\"They left, but the record still says they hold it.\"","\"A revoked identity cannot hold or receive.\"")]
yy=y+0.2
for a,b in pairs:
    box(s,0.75,yy,5.4,0.92,fill=REDBG,border=RED)
    txt(s,1.0,yy+0.28,4.9,0.4,a,13.5,False,RED,line=1.2)
    arrow(s,6.35,yy+0.36,0.5,0.2,INK)
    box(s,7.05,yy,5.55,0.92,fill=GRNBG,border=GRN)
    txt(s,7.3,yy+0.28,5.05,0.4,b,13.5,True,GRN,line=1.2)
    yy+=1.03
box(s,0.75,yy+0.15,11.85,0.8,fill=BLACK,border=None)
txt(s,1.05,yy+0.33,11.3,0.45,"What changes is not the screens. It is who has to be trusted for the record to mean anything.",16,True,WHITE)
note(s,"No percentages here. We have not measured any, and we will not invent them.")

# ══════════════════ 15 HONEST CLAIM + CLOSE
s=slide()
y=head(s,"Speaker 5 · Close","What we can honestly claim, and what we cannot")
box(s,0.75,y+0.1,5.8,2.7,fill=GRNBG,border=GRN)
txt(s,1.05,y+0.32,5.2,0.3,"BUILT AND VERIFIED",11,True,GRN)
for i,t in enumerate(["Identity lifecycle — create, suspend, revoke, rotate",
                      "Permissions enforced by the system itself",
                      "Asset custody bound to an active identity",
                      "Independent verification, no login required",
                      "45 automated tests · 3 flaws found and fixed"]):
    txt(s,1.05,y+0.7+i*0.4,0.22,0.3,"✓",13,True,GRN)
    txt(s,1.35,y+0.7+i*0.4,4.95,0.35,t,12.5,False,INK,line=1.2)
box(s,6.75,y+0.1,5.85,2.7,fill=SOFT,border=LINE)
txt(s,7.05,y+0.32,5.2,0.3,"WE ARE NOT CLAIMING",11,True,MUTE)
for i,t in enumerate(["Measured reduction in inventory loss",
                      "Measured reduction in breaches",
                      "Deployment inside BEL",
                      "Production-scale field results",
                      "That we have solved trust — only that we made it checkable"]):
    txt(s,7.05,y+0.7+i*0.4,0.22,0.3,"—",13,True,MUTE)
    txt(s,7.35,y+0.7+i*0.4,5.0,0.35,t,12.5,False,INK,line=1.2)
box(s,0.75,y+3.0,11.85,1.35,fill=BLACK,border=None)
txt(s,1.05,y+3.2,11.3,0.35,"So — who can prove who controls this asset right now?",17,True,RGBColor(0xD6,0xD3,0xCD))
txt(s,1.05,y+3.6,11.3,0.6,"Don't just record what happened. Make it provable.",30,True,ACC)
note(s,"Stop here. Do not say \"thank you, any questions\". Let it land.")

prs.save(OUT)
print("saved:", OUT, "slides:", len(Presentation(OUT).slides))
