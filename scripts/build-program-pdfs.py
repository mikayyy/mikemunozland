"""Create full case-study downloads from the established public-facing copy."""
from pathlib import Path
from xml.sax.saxutils import escape
import json, os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, PageBreak, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = Path(os.environ.get('PORTFOLIO_FONT_DIR', 'C:/Windows/Fonts'))
for name, filename in [('Body','calibri.ttf'), ('Bold','calibrib.ttf'), ('Display','georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
INK, RUST = HexColor('#2B1D14'), HexColor('#B54B2A')
styles = {
 'title': ParagraphStyle('Title',fontName='Display',fontSize=25,leading=29,textColor=INK,spaceAfter=12),
 'heading': ParagraphStyle('Heading',fontName='Display',fontSize=19,leading=23,textColor=INK,spaceBefore=12,spaceAfter=10),
 'subhead': ParagraphStyle('Subhead',fontName='Bold',fontSize=11,leading=14,textColor=RUST,spaceBefore=9,spaceAfter=4),
 'body': ParagraphStyle('Body',fontName='Body',fontSize=10.5,leading=14,textColor=INK,spaceAfter=8),
 'caption': ParagraphStyle('Caption',fontName='Body',fontSize=9,leading=12,textColor=INK,spaceBefore=7,spaceAfter=10),
}
def paragraph(text, style='body'):
    return Paragraph(escape(text).replace('—','-').replace('–','-'), styles[style])
def section(data, index, skip=()):
    output=[]
    for b in data['sections'][index]['blocks']:
        if b['text'] in skip: continue
        style={'h1':'title','h2':'heading','h3':'subhead','dt':'subhead'}.get(b['type'],'body')
        output.append(paragraph(b['text'],style))
    return output
def figure(file, caption, width=490):
    target=ROOT/'src/assets'/file
    with PILImage.open(target) as im: height=width*im.height/im.width
    return [KeepTogether([Image(str(target),width=width,height=height), paragraph(caption,'caption')])]
def build(name, title, story):
    output=ROOT/'public/downloads'/name
    output.parent.mkdir(parents=True,exist_ok=True)
    def frame(c,doc):
        c.saveState()
        c.setFillColor(HexColor('#F6EEDC')); c.rect(0,0,612,792,fill=1,stroke=0)
        c.setFillColor(RUST); c.setFont('Helvetica-Bold',9)
        c.drawString(56,760,'MICHAEL MUÑOZ / LEARNING DESIGN & STRATEGY')
        c.setStrokeColor(HexColor('#D8C4AC')); c.line(56,45,556,45)
        c.setFillColor(INK); c.setFont('Helvetica',8)
        c.drawString(56,30,title.upper()); c.drawRightString(556,30,str(doc.page)); c.restoreState()
    doc=SimpleDocTemplate(str(output),pagesize=(612,792),leftMargin=56,rightMargin=56,topMargin=60,bottomMargin=60,title=title,author='Michael Muñoz')
    doc.build(story,onFirstPage=frame,onLaterPages=frame)
    print(output)

boot=json.loads((ROOT/'src/content/bootcamp-case-study.json').read_text(encoding='utf-8'))
# Keep the original copy and source labels. Page breaks separate the problem,
# program architecture, reconstructed practice, and available evidence.
story=section(boot,0)
story += [paragraph('Approximately 50 intended participants, from Senior Associates through Directors. This is an audience estimate, not a completion count.','caption'),paragraph(boot['disclosure'],'caption')]
story += [PageBreak()]+section(boot,1)
story += figure('bootcamp/agenda.png','Illustrative agenda with adapted session titles. Exact clock times are not claimed.',width=490)
story += [PageBreak()]+section(boot,2)
story += figure('bootcamp/lifecycle.png','The selected instructional sequence follows the engagement lifecycle.',width=240)
story += [PageBreak()]+section(boot,3)
story += figure('bootcamp/raid.png','Illustrative RAID entry: the owner, next action, escalation trigger, and reasoning make judgment visible.',width=370)
story += [PageBreak()]+section(boot,4)
story += [paragraph('Evidence limits','subhead'),paragraph('Survey response counts, capstone scores, and post-program delivery measures are unavailable. The approximately 50-person audience is an intended cohort; confidence and value are reported perceptions. Proposed assessment and coaching improvements are not claimed as implemented.'),paragraph(boot['disclosure'],'caption')]
build('delivery-lead-bootcamp-case-study.pdf','Delivery Lead Bootcamp',story)

architecture=json.loads((ROOT/'src/content/architecture-case-study.json').read_text(encoding='utf-8'))
story=[paragraph('Shared Learning Architecture & Strategy','title')]+section(architecture,0,skip=('One core. Many ways to put it to work.',))
story += [paragraph(architecture['disclosure'],'caption')]
story += [PageBreak()]+section(architecture,1)
story += figure('architecture/model.png','Illustrative reconstruction of the operating model; not an original internal artifact.',width=430)
story += [PageBreak()]+section(architecture,2)+section(architecture,3)
story += [paragraph('Interpretation and limits','subhead'),paragraph('The operating architecture is described from the project owner’s account. Specific adoption levels, dates, and outcome values are not supplied. Activity and contribution counts do not establish the quality of behavior or a business result. No proprietary competency definitions or original discovery-call material are reproduced.'),paragraph(architecture['disclosure'],'caption')]
build('shared-learning-architecture-case-study.pdf','Shared Learning Architecture & Strategy',story)
