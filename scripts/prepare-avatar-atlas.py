"""Prepare authored transparent cutouts for square runtime cells; no recoloring or shape edits.
Each silhouette is fit with its soles on y=97%, at a shared foot anchor x=50%.
"""
from pathlib import Path
from PIL import Image
import sys

def prepare(source,target):
    im=Image.open(source).convert('RGBA');w,h=im.size;assert abs(w/h-1.5)<.03,'Expected 3 x 2 square-cell atlas'
    out=Image.new('RGBA',(1536,1024));items=[]
    for i in range(6):
        cell=im.crop((i%3*w//3,i//3*h//2,(i%3+1)*w//3,(i//3+1)*h//2))
        solid=cell.getchannel('A').point(lambda a:255 if a>16 else 0);bounds=solid.getbbox();assert bounds
        crop=cell.crop(bounds);scale=480/crop.height;nw=round(crop.width*scale);assert nw<490,'Figure exceeds cell width'
        crop=crop.resize((nw,480),Image.Resampling.LANCZOS)
        foot=crop.getchannel('A').crop((0,440,nw,480)).point(lambda a:255 if a>40 else 0).getbbox()
        center=(foot[0]+foot[2])/2 if foot else nw/2
        x=round(256-center);y=round(512*.97)-480
        assert x>=0 and x+nw<=512
        out.alpha_composite(crop,(i%3*512+x,i//3*512+y));items.append((i,x,y,nw))
    target=Path(target);temp=target.with_name(target.stem+'.prepared.webp');out.save(temp,format='WEBP',quality=95,method=6)
    assert temp.stat().st_size>10000;Image.open(temp).verify();temp.replace(target);print(target,items)
if __name__=='__main__':prepare(sys.argv[1],sys.argv[2])
