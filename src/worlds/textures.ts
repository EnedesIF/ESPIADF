import * as THREE from 'three';

/** Texturas procedurais (canvas) — zero download, ótimas para notebook escolar. */

export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Fachada de bloco residencial com janelas em fita (referência às superquadras). */
export function facadeTextures(seed = 1) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const W = 256, H = 256, cols = 8, rows = 6;
  const draw = (night: boolean) => (g: CanvasRenderingContext2D) => {
    g.fillStyle = night ? '#000' : '#d9d6cc'; g.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      const y = r * (H / rows);
      if (!night) { g.fillStyle = '#bdb8aa'; g.fillRect(0, y + H / rows - 6, W, 6); }
      for (let c = 0; c < cols; c++) {
        const x = c * (W / cols);
        if (night) {
          const lit = rnd() > 0.55;
          g.fillStyle = lit ? (rnd() > 0.5 ? '#ffd38a' : '#fff1c9') : '#000';
          g.fillRect(x + 4, y + 8, W / cols - 8, H / rows - 18);
        } else {
          g.fillStyle = rnd() > 0.8 ? '#5d7f8c' : '#3e5a66';
          g.fillRect(x + 4, y + 8, W / cols - 8, H / rows - 18);
          g.fillStyle = '#ffffff22'; g.fillRect(x + 4, y + 8, (W / cols - 8) * 0.4, H / rows - 18);
          // brises
          g.fillStyle = '#c9c4b6'; g.fillRect(x, y + 4, 3, H / rows - 8);
        }
      }
    }
  };
  return {
    map: canvasTex(W, H, draw(false)),
    emissive: canvasTex(W, H, draw(true))
  };
}

export function textSign(lines: string[], opts: { w?: number; h?: number; bg?: string; fg?: string; accent?: string; font?: number } = {}) {
  const w = opts.w ?? 512, h = opts.h ?? 256;
  return canvasTex(w, h, g => {
    g.fillStyle = opts.bg ?? '#0e2a33'; g.fillRect(0, 0, w, h);
    if (opts.accent) { g.fillStyle = opts.accent; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08); }
    g.fillStyle = opts.fg ?? '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const fs = opts.font ?? Math.floor(h / (lines.length + 1.2));
    lines.forEach((l, i) => {
      const weight = i === 0 ? 900 : 700;
      let size = i === 0 ? fs : fs * 0.62;
      g.font = `${weight} ${size}px Arial, sans-serif`;
      const measured = g.measureText(l).width;
      if (measured > w * .88) { size *= w * .88 / measured; g.font = `${weight} ${size}px Arial, sans-serif`; }
      g.fillText(l, w / 2, h * ((i + 1) / (lines.length + 1)));
    });
  });
}

export function stripes(a = '#ff7a1a', b = '#f2f2f2') {
  return canvasTex(64, 64, g => {
    g.fillStyle = b; g.fillRect(0, 0, 64, 64);
    g.fillStyle = a;
    for (let i = -64; i < 128; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 11, 0); g.lineTo(i + 11 - 64, 64); g.lineTo(i - 64, 64); g.fill(); }
  }, [2, 1]);
}

export function courtTexture() {
  return canvasTex(256, 128, g => {
    g.fillStyle = '#1f6f5c'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#2a8a72'; g.fillRect(14, 10, 228, 108);
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 3;
    g.strokeRect(14, 10, 228, 108); g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 118); g.stroke();
    g.beginPath(); g.arc(128, 64, 18, 0, Math.PI * 2); g.stroke();
    g.strokeRect(14, 40, 30, 48); g.strokeRect(212, 40, 30, 48);
  });
}

export function groundTexture() {
  return canvasTex(512, 512, g => {
    g.fillStyle = '#7d8a50'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 512, y = Math.random() * 512, r = 20 + Math.random() * 60;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const c = Math.random() > 0.75 ? '150,110,70' : Math.random() > 0.5 ? '140,152,90' : '104,118,70';
      gr.addColorStop(0, `rgba(${c},.45)`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(150,160,96,.5)' : 'rgba(96,108,64,.5)';
      g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 2 + Math.random() * 3);
    }
  }, [24, 18]);
}

/** Legible art for the in-world digital terminal (all entries are fictional). */
export function mobilityDisplay(){
 return canvasTex(768,1024,g=>{
  g.fillStyle='#09365a';g.fillRect(0,0,768,1024);
  g.fillStyle='#086179';g.fillRect(0,0,768,150);
  g.fillStyle='#fff';g.font='bold 58px Arial';g.fillText('Linhas e itinerários',36,86);
  g.font='28px Arial';g.fillStyle='#b0dfeb';g.fillText('PARADA 214 • PAINEL DO CENÁRIO',36,128);
  const rows=[['102','Asa Sul','3 min'],['103','Rodoviária','12 min'],['110','W3 Sul','18 min'],['DEMO-214','Escola','25 min']];
  rows.forEach(([n,d,t],i)=>{const y=210+i*150;g.fillStyle=i===3?'#ffd16d':'#c5deeb';g.fillRect(24,y,720,125);g.fillStyle=i===3?'#17516c':'#0c4774';g.fillRect(34,y+12,215,101);g.fillStyle='white';g.font='bold 34px Arial';g.fillText(n,48,y+75);g.fillStyle='#143f55';g.font='32px Arial';g.fillText(d,270,y+56);g.font='bold 30px Arial';g.fillText(t,270,y+99)});
  g.fillStyle='#aed4d9';g.font='25px Arial';g.fillText('DADO SIMULADO PARA DEMONSTRAÇÃO',28,927);
  g.fillStyle='#48f0b7';g.font='bold 32px Arial';g.fillText('TOQUE PARA INVESTIGAR →',40,990);
 });
}
