"""Rebuild the downloadable case study with reportlab and the source screenshots."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parents[1]
CONTENT = json.loads((ROOT / 'src/content/margin-case-study.json').read_text(encoding='utf-8'))
OUTPUT = ROOT / 'public/downloads/the-margin-case-study.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
# Override this directory when rebuilding on a computer with different fonts.
import os
FONT_DIR = Path(os.environ.get('PORTFOLIO_FONT_DIR', 'C:/Windows/Fonts'))
for name, file in [('Body', 'calibri.ttf'), ('BodyBold', 'calibrib.ttf'), ('Display', 'georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')
INK = HexColor('#2B1D14')
RUST = HexColor('#B54B2A')
CREAM = HexColor('#F6EEDC')
styles = {
    'title': ParagraphStyle('Title', fontName='Display', fontSize=32, leading=36, textColor=INK, spaceAfter=12),
    'heading': ParagraphStyle('Heading', fontName='Display', fontSize=22, leading=26, textColor=INK, spaceAfter=14),
    'subhead': ParagraphStyle('Subhead', fontName='BodyBold', fontSize=12, leading=15, textColor=RUST, spaceBefore=10, spaceAfter=5),
    'body': ParagraphStyle('Body', fontName='Body', fontSize=11, leading=15, textColor=INK, spaceAfter=10),
    'caption': ParagraphStyle('Caption', fontName='Body', fontSize=9, leading=12, textColor=INK, spaceBefore=7, spaceAfter=12),
    'eyebrow': ParagraphStyle('Eyebrow', fontName='BodyBold', fontSize=9, leading=12, textColor=RUST, spaceAfter=10),
}
def p(text, style='body'):
    return Paragraph(escape(text).replace('—', '-').replace('–', '-'), styles[style])
def paragraphs(section):
    return [p(text) for text in CONTENT['sections'][section]['paragraphs']]
def figure(name, caption, width=500):
    image_path = ROOT / 'src/assets/margin' / f'{name}.png'
    with PILImage.open(image_path) as image:
        height = width * image.height / image.width
    return [Image(str(image_path), width=width, height=height), p(caption, 'caption')]
def decorate(c, doc):
    c.saveState()
    c.setFillColor(CREAM)
    c.rect(0, 0, 612, 792, fill=1, stroke=0)
    c.setFillColor(RUST)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(56, 760, 'MICHAEL MUÑOZ / LEARNING EXPERIENCE DESIGN')
    c.setStrokeColor(HexColor('#D8C4AC'))
    c.line(56, 45, 556, 45)
    c.setFont('Helvetica', 9)
    c.setFillColor(INK)
    c.drawString(56, 30, 'THE MARGIN / FICTIONAL PORTFOLIO CASE STUDY')
    c.drawRightString(556, 30, f'{doc.page}')
    c.restoreState()

story = [p('THE MARGIN', 'title'), p('Designing judgment under ambiguity', 'subhead'), p(CONTENT['intro']),
         p('Role: Learning Experience Designer | Audience: Early-career professionals', 'caption'),
         p('Format: Interactive scenario prototype | Setting: Fictional Northstar Outdoor Experiences', 'caption')]
story += figure('cover', 'The field journal frames the task: notice what is known, test assumptions, and make an explainable route call.', width=360)
story += [p('The challenge', 'subhead')] + paragraphs(0)
story += [PageBreak(), p('01 / DESIGN FRAMEWORK', 'eyebrow'), p('Practice calibrated autonomy', 'heading')] + paragraphs(1)
story += figure('signals', 'At Laurel Junction, learners distinguish evidence, forecasts, options, and unverified hopes before committing three signals.')
story += [PageBreak(), p('02 / EXPERIENCE FLOW', 'eyebrow'), p('Three decisions, one evolving route', 'heading')] + paragraphs(2)
story += figure('map', 'The living map carries timing, location, changed conditions, and available alternatives between journal pages.')
story += [p('The decision sequence', 'subhead'), p('1. At departure: decide how to respond to a late start.  2. At the junction: identify which signals change the plan.  3. Make the call: recommend a response and build an update to operations and guests.')]
story += [PageBreak(), p('03 / DESIGN DECISIONS', 'eyebrow'), p('Judgment becomes visible', 'heading')]
for title, text in zip(CONTENT['sections'][3]['subheads'], CONTENT['sections'][3]['paragraphs']):
    story += [p(title, 'subhead'), p(text)]
story += figure('call', 'A reviewed recommendation includes the situation, operations support, and guest explanation.', width=360)
story += [PageBreak(), p('04 / OUTCOME AND REFLECTION', 'eyebrow'), p('What the prototype demonstrates', 'heading')] + paragraphs(4)
left = figure('outcome', 'One possible outcome: a changed route preserves the gathering.', width=240)
right = figure('debrief', 'The debrief connects earlier choices to a reusable field aid.', width=240)
table = Table([[left, right]], colWidths=[250, 250])
table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 10)]))
story += [table, p('Review before claiming impact', 'subhead'), p('A future evaluation should observe first-time visitors, record completion time and decision reasoning, and test the behavior in a new scenario. The intended short experience has not yet been validated through measured learning or transfer results.')]
story += [Paragraph('Explore the portfolio and playable prototype at <link href="https://mikemunozland.com/work/the-margin" color="#B54B2A">mikemunozland.com/work/the-margin</link>.<br/>This is the intended public URL; availability depends on portfolio publication.', styles['caption'])]
doc = SimpleDocTemplate(str(OUTPUT), pagesize=(612, 792), leftMargin=56, rightMargin=56, topMargin=60, bottomMargin=60,
                        title='The Margin - Designing judgment under ambiguity', author='Michael Muñoz')
doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
print(OUTPUT)
