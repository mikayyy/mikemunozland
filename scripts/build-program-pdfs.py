"""Build compact, editorial PDF case studies from the approved source copy.

Canvas placement keeps the two-column composition predictable. Every text block
measures its own height and fails loudly if it would cross the footer.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json, os
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
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
CREAM, TINT, LINE = map(HexColor, ['#F6EEDC','#EADDC8','#D8C4AC'])
styles = {
 'title': ParagraphStyle('Title',fontName='Display',fontSize=28,leading=31,textColor=INK,spaceAfter=10),
 'heading': ParagraphStyle('Heading',fontName='Display',fontSize=16,leading=18,textColor=INK,spaceAfter=9),
 'subhead': ParagraphStyle('Subhead',fontName='Bold',fontSize=10.5,leading=13,textColor=RUST,spaceBefore=6,spaceAfter=4,keepWithNext=True),
 'body': ParagraphStyle('Body',fontName='Body',fontSize=10,leading=12.5,textColor=INK,spaceAfter=6),
 'caption': ParagraphStyle('Caption',fontName='Body',fontSize=8.5,leading=11,textColor=INK,spaceAfter=6),
 'label': ParagraphStyle('Label',fontName='Bold',fontSize=8.5,leading=11,textColor=RUST,spaceBefore=3,spaceAfter=3),
 'quote': ParagraphStyle('Quote',fontName='Display',fontSize=11,leading=14,textColor=INK,spaceBefore=7,spaceAfter=8),
}

def clean(text):
    return escape(text).replace('—','-').replace('–','-').replace('‑','-')

class Page:
    def __init__(self, c, title, number, total, category, heading):
        self.c = c
        c.setFillColor(CREAM); c.rect(0,0,612,792,fill=1,stroke=0)
        c.setFillColor(RUST); c.rect(44,745,32,4,fill=1,stroke=0)
        c.setFont('Bold',8); c.drawString(86,744,'MICHAEL MUÑOZ / LEARNING DESIGN & STRATEGY')
        self.text(category.upper(),44,713,524,'label')
        self.top = self.text(heading,44,690,524,'title') - 6
        c.setStrokeColor(LINE); c.line(44,44,568,44)
        c.setFont('Body',8); c.setFillColor(INK)
        c.drawString(44,29,title); c.drawRightString(568,29,f'{number:02d} / {total:02d}')
    def text(self, text, x, y, width=250, style='body'):
        s=styles[style]
        y -= s.spaceBefore
        p=Paragraph(clean(text),s)
        _,height=p.wrap(width,700)
        if y-height < 56:
            raise ValueError(f'Page overflow at {text[:60]!r}: bottom={y-height:.1f}')
        p.drawOn(self.c,x,y-height)
        return y-height-s.spaceAfter
    def blocks(self, blocks, x, y, width=250):
        for b in blocks:
            style={'h1':'title','h2':'heading','h3':'subhead','dt':'label'}.get(b['type'],'body')
            if b['text'].isupper(): style='label'
            if b['text'].startswith('“'): style='quote'
            if b['type']=='li' and b['text'].startswith('DAY '):
                # Restore the source agenda's hierarchy instead of a run-on list.
                agendas = {
                    'DAY 01': ('Launch the engagement', ['Program welcome','Cohort connections','Starting a client engagement','Working across cultures']),
                    'DAY 02': ('Lead the delivery', ['AI in delivery decisions','AI judgment lab','Commercial tradeoffs','Service operations']),
                    'DAY 03': ('Close and renew', ['Quality signals and risk','Closing and continuing the work','Final case challenge · 2 hours']),
                }
                key=b['text'][:6]; title,items=agendas[key]
                y=self.text(key+' / '+title,x,y,width,'subhead')
                y=self.text(' · '.join(items),x,y,width,'body')
            elif b['type']=='li':
                y=self.text('• '+b['text'],x+8,y,width-8,style)
            else: y=self.text(b['text'],x,y,width,style)
        return y
    def picture(self, file, x, y, width, caption):
        target=ROOT/'src/assets'/file
        with PILImage.open(target) as im: height=width*im.height/im.width
        if y-height < 75: raise ValueError(f'Figure exceeds available space: {y=}, {height=}')
        self.c.drawImage(str(target),x,y-height,width=width,height=height,mask='auto')
        return self.text(caption,x,y-height-7,width,'caption')
    def panel(self, label, text, x, y, width=250):
        # Measure before painting so the panel follows the content height.
        p=Paragraph(clean(text),styles['caption']); _,h=p.wrap(width-24,700)
        height=h+39
        if y-height < 56: raise ValueError(f'Panel exceeds available space: {y=}, {height=}')
        self.c.setFillColor(TINT); self.c.roundRect(x,y-height,width,height,6,fill=1,stroke=0)
        self.text(label,x+12,y-9,width-24,'label')
        self.text(text,x+12,y-27,width-24,'caption')
        return y-height-12

def start(name,title):
    target=ROOT/'public/downloads'/name
    target.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(target),pagesize=(612,792))
    c.setTitle(title); c.setAuthor('Michael Muñoz')
    return c,target

boot=json.loads((ROOT/'src/content/bootcamp-case-study.json').read_text(encoding='utf-8'))
c,target=start('delivery-lead-bootcamp-case-study.pdf','Delivery Lead Bootcamp')
p=Page(c,'Delivery Lead Bootcamp',1,2,'Performance strategy / Program design','Delivery Lead Bootcamp')
# Preserve source prose while distributing the narrative across facing columns.
left=p.blocks(boot['sections'][0]['blocks'][2:],44,p.top)
left=p.panel('AUDIENCE', 'Approximately 50 intended participants, from Senior Associates through Directors. This is an audience estimate, not a completion count.',44,left)
right=p.blocks(boot['sections'][2]['blocks'],318,p.top)
y=min(left,right)-8
p.picture('bootcamp/agenda.png',106,y,400,'Illustrative agenda with adapted session titles. Exact clock times are not claimed.')
c.showPage()
p=Page(c,'Delivery Lead Bootcamp',2,2,'Program design / Practice & evidence','From program to practice')
left=p.blocks(boot['sections'][1]['blocks'],44,p.top)
left=p.blocks(boot['sections'][4]['blocks'],44,left-8)
right=p.blocks(boot['sections'][3]['blocks'],318,p.top)
# The reconstructed RAID is typeset above rather than repeated as a screenshot.
p.panel('ABOUT THIS CASE',boot['disclosure'],44,min(left,right)-2,524)
c.save(); print(target)

architecture=json.loads((ROOT/'src/content/architecture-case-study.json').read_text(encoding='utf-8'))
c,target=start('shared-learning-architecture-case-study.pdf','Shared Learning Architecture & Strategy')
styles['body'].fontSize=9.5; styles['body'].leading=11.8; styles['body'].spaceAfter=5
p=Page(c,'Shared Learning Architecture & Strategy',1,1,'Learning strategy / Capability architecture','Shared Learning Architecture & Strategy')
left=p.blocks(architecture['sections'][0]['blocks'][2:],44,p.top)
left=p.blocks(architecture['sections'][3]['blocks'],44,left-6)
right=p.picture('architecture/model.png',353,p.top,180,'Illustrative reconstruction of the operating model; not an original internal artifact.')
right=p.blocks(architecture['sections'][1]['blocks'],318,right-4)
right=p.blocks(architecture['sections'][2]['blocks'],318,right-6)
y=min(left,right)-4
p.panel('INTERPRETATION & CONFIDENTIALITY', 'The operating architecture is described from the project owner’s account. No proprietary competency definitions or original discovery-call material are reproduced. '+architecture['disclosure'],44,y,524)
c.save(); print(target)
