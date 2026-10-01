"""Build the checked-in sharing card and browser icon with Pillow.
Only rerun when the site's visual identity changes; normal Astro builds do not
need Python or access to local fonts.
"""
from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
FONTS = Path(os.environ.get('PORTFOLIO_FONT_DIR', 'C:/Windows/Fonts'))
def font(size, bold=False):
    return ImageFont.truetype(str(FONTS / ('segoeuib.ttf' if bold else 'segoeui.ttf')), size)
cream, ink, rust, paper, moss = '#F6EEDC', '#2B1D14', '#B54B2A', '#EFE4CC', '#5F6B3E'
im = Image.new('RGB',(1200,630),cream)
d = ImageDraw.Draw(im)
d.ellipse((64,48,146,130),fill=ink)
d.text((105,89),'MM',font=font(28,True),fill=cream,anchor='mm')
d.text((172,91),'LEARNING DESIGN & STRATEGY',font=font(23,True),fill=rust,anchor='lm')
d.text((64,182),'Michael Muñoz',font=font(76,True),fill=ink)
d.text((68,300),'Experience. Programs. Architecture.',font=font(36),fill=ink)
for x,word in [(68,'Experience design'),(409,'Program design'),(750,'Learning strategy')]:
    d.rounded_rectangle((x,405,x+303,475),radius=16,fill=paper,outline=ink,width=2)
    d.text((x+151,440),word,font=font(23,True),fill=ink,anchor='mm')
points=[(0,1),(.03,.3),(.08,.8),(.14,.2),(.20,.7),(.26,.1),(.33,.9),(.40,.25),(.47,.75),(.54,.15),(.61,.85),(.68,.3),(.75,.7),(.82,.2),(.89,.8),(.95,.25),(1,1)]
d.polygon([(int(x*1200),int(538+y*28)) for x,y in points]+[(1200,630),(0,630)],fill=ink)
d.text((68,588),'mikemunozland.com',font=font(22),fill=cream,anchor='lm')
im.save(ROOT/'public/social-preview.png',optimize=True)
icon=Image.new('RGBA',(256,256),(0,0,0,0)); draw=ImageDraw.Draw(icon)
draw.ellipse((0,0,255,255),fill=ink)
draw.text((128,125),'MM',font=font(85,True),fill=cream,anchor='mm')
icon.save(ROOT/'public/favicon.ico',sizes=[(16,16),(32,32),(48,48),(64,64)])
print('Built social-preview.png and favicon.ico')
