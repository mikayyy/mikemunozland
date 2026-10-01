"""Build single-column case studies using the portfolio's paper/card motifs.

Approved copy lives in JSON; pagination and presentation are kept here so the
website downloads can be rebuilt without rewriting the case-study narrative.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json, os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, PageBreak, Spacer, KeepTogether, Table, TableStyle, Flowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = Path(os.environ.get('PORTFOLIO_FONT_DIR', 'C:/Windows/Fonts'))
for name, filename in [('Body','calibri.ttf'), ('Bold','calibrib.ttf'), ('Display','georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
INK, RUST, CREAM, PAPER, EDGE, MOSS = map(HexColor,['#2B1D14','#B54B2A','#F6EEDC','#EFE4CC','#D8C4AC','#425F4C'])
WIDTH=488
styles={
 'title':ParagraphStyle('Title',fontName='Display',fontSize=27,leading=31,textColor=INK,spaceAfter=14),
 'heading':ParagraphStyle('Heading',fontName='Display',fontSize=18,leading=22,textColor=INK,spaceBefore=8,spaceAfter=8,keepWithNext=True),
 'subhead':ParagraphStyle('Subhead',fontName='Bold',fontSize=11,leading=14,textColor=RUST,spaceBefore=8,spaceAfter=5,keepWithNext=True),
 'body':ParagraphStyle('Body',fontName='Body',fontSize=11,leading=14,textColor=INK,spaceAfter=5),
 'caption':ParagraphStyle('Caption',fontName='Body',fontSize=9,leading=12,textColor=INK,spaceAfter=5),
 'label':ParagraphStyle('Label',fontName='Bold',fontSize=9,leading=12,textColor=RUST,spaceBefore=4,spaceAfter=4,keepWithNext=True),
 'quote':ParagraphStyle('Quote',fontName='Display',fontSize=11,leading=14,textColor=INK,spaceBefore=0,spaceAfter=5),
 'badge':ParagraphStyle('Badge',fontName='Bold',fontSize=8.5,leading=12,textColor=CREAM),
}
def para(text,style='body'):
    text=escape(text).replace('\u2014','-').replace('\u2013','-').replace('\u2011','-')
    return Paragraph(text,styles[style])

class TornDivider(Flowable):
    """The homepage's polygon divider, scaled into a quiet section separator."""
    def __init__(self):
        Flowable.__init__(self); self.width=WIDTH; self.height=21
    def draw(self):
        points=[(0,0),(.03,.70),(.08,.20),(.14,.80),(.20,.30),(.26,.90),(.33,.10),(.40,.75),(.47,.25),(.54,.85),(.61,.15),(.68,.70),(.75,.30),(.82,.80),(.89,.20),(.95,.75),(1,0)]
        path=self.canv.beginPath(); path.moveTo(0,4)
        for x,y in points[1:]: path.lineTo(x*WIDTH,4+y*8)
        path.close(); self.canv.setFillColor(INK); self.canv.drawPath(path,fill=1,stroke=0)

def badge(text):
    # A small dark capsule echoes the site's experience and work-card labels.
    table=Table([[para(text.upper(),'badge')]],colWidths=[WIDTH])
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),INK),('LEFTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    return [table,Spacer(1,12)]

def card(blocks, shade=PAPER):
    table=Table([[blocks]],colWidths=[WIDTH])
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),shade),('BOX',(0,0),(-1,-1),.7,EDGE),('LEFTPADDING',(0,0),(-1,-1),14),('RIGHTPADDING',(0,0),(-1,-1),14),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    return [KeepTogether([table,Spacer(1,8)])]

def blocks(items):
    output=[]
    merged=[]
    index=0
    priority_titles={'Outcome ownership','Business Context & Responsible Delivery','AI-Native Delivery'}
    while index<len(items):
        b=items[index]
        if b['type']=='h3' and b['text'] in priority_titles:
            merged.append({'type':'h3','text':b['text']+' / '+items[index+1]['text']}); index+=2
        elif b['type']=='dt' and index+1<len(items) and items[index+1]['type']=='dd':
            merged.append({'type':'definition','text':b['text'],'detail':items[index+1]['text']}); index+=2
        else: merged.append(b); index+=1
    for b in merged:
        text=b['text']
        style={'h1':'title','h2':'heading','h3':'subhead','dt':'label'}.get(b['type'],'body')
        if text.isupper(): style='label'
        if text.startswith('\u201c'): style='quote'
        if b['type']=='definition':
            output.append(Paragraph('<font name="Bold" size="9" color="#B54B2A">'+escape(text)+'</font><br/>'+escape(b['detail']),styles['body']))
        elif b['type']=='li' and text.startswith('DAY '):
            agendas={
             'DAY 01':('Launch the engagement',['Program welcome','Cohort connections','Starting a client engagement','Working across cultures']),
             'DAY 02':('Lead the delivery',['AI in delivery decisions','AI judgment lab','Commercial tradeoffs','Service operations']),
             'DAY 03':('Close and renew',['Quality signals and risk','Closing and continuing the work','Final case challenge \u00b7 2 hours']),
            }
            key=text[:6]; title,items=agendas[key]
            output+=card([para(key+' / '+title,'subhead'),para(' \u00b7 '.join(items))])
        else:
            output.append(para(('\u2022 ' if b['type']=='li' else '')+text,style))
    return output

def figure(file,caption,width=WIDTH):
    path=ROOT/'src/assets'/file
    with PILImage.open(path) as im: height=width*im.height/im.width
    image=Image(str(path),width=width,height=height)
    image.hAlign='CENTER'
    return [KeepTogether([Spacer(1,5),image,Spacer(1,8),para(caption,'caption')])]

def build(name,title,story):
    target=ROOT/'public/downloads'/name
    def frame(c,doc):
        c.saveState(); c.setFillColor(CREAM); c.rect(0,0,612,792,fill=1,stroke=0)
        c.setFillColor(INK); c.circle(69,752,13,fill=1,stroke=0)
        c.setFillColor(CREAM); c.setFont('Bold',9); c.drawCentredString(69,749,'MM')
        c.setFillColor(RUST); c.setFont('Bold',8); c.drawString(91,749,'MICHAEL MU\u00d1OZ / LEARNING DESIGN & STRATEGY')
        c.setStrokeColor(EDGE); c.line(56,47,556,47)
        c.setFillColor(INK); c.setFont('Body',8); c.drawString(56,32,title); c.drawRightString(556,32,f'{doc.page:02d}')
        c.restoreState()
    doc=SimpleDocTemplate(str(target),pagesize=(612,792),leftMargin=56,rightMargin=56,topMargin=62,bottomMargin=56,title=title,author='Michael Mu\u00f1oz')
    doc.build(story,onFirstPage=frame,onLaterPages=frame)
    print(target)

boot=json.loads((ROOT/'src/content/bootcamp-case-study.json').read_text(encoding='utf-8'))
story=badge('Performance strategy / Program design')+blocks(boot['sections'][0]['blocks'][1:])
story+=card([para('AUDIENCE','label'),para('Approximately 50 intended participants, from Senior Associates through Directors. This is an audience estimate, not a completion count.','caption')])
story+=[TornDivider()]+figure('bootcamp/agenda.png','Illustrative agenda with adapted session titles. Exact clock times are not claimed.',width=460)
story+=[PageBreak()]+badge('01 / Program architecture')+blocks(boot['sections'][1]['blocks'])
story+=[TornDivider()]+blocks(boot['sections'][2]['blocks'])
story+=[PageBreak()]+badge('02 / Practice & reflection')+blocks(boot['sections'][3]['blocks'])
story+=[TornDivider()]+blocks(boot['sections'][4]['blocks'])
story+=card([para('ABOUT THIS CASE','label'),para(boot['disclosure'],'caption')])
build('delivery-lead-bootcamp-case-study.pdf','Delivery Lead Bootcamp',story)

architecture=json.loads((ROOT/'src/content/architecture-case-study.json').read_text(encoding='utf-8'))
story=badge('Learning strategy / Capability architecture')+[para('Shared Learning Architecture & Strategy','title')]+blocks(architecture['sections'][0]['blocks'][2:])
story+=[TornDivider()]+figure('architecture/model.png','Illustrative reconstruction of the operating model; not an original internal artifact.',width=330)
story+=[PageBreak()]+badge('01 / Design decisions & evidence')+blocks(architecture['sections'][1]['blocks'])
story+=[TornDivider()]+blocks(architecture['sections'][2]['blocks'])
story+=[TornDivider()]+blocks(architecture['sections'][3]['blocks'])
story+=card([para('INTERPRETATION & CONFIDENTIALITY','label'),para('The operating architecture is described from the project owner\u2019s account. No proprietary competency definitions or original discovery-call material are reproduced. '+architecture['disclosure'],'caption')])
build('shared-learning-architecture-case-study.pdf','Shared Learning Architecture & Strategy',story)
