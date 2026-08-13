/** Crtanje graviranja na 2D canvas — deljena logika za 3D teksturu. */

export const TEX_W = 1024;
export const TEX_H = 512;

export interface DrawOptions {
  mode: "text" | "image";
  text: string;
  fontFamily: string;
  fontSize: number;
  posX: number;
  posY: number;
  imageScale: number;
  imageThreshold: number;
  imageInvert: boolean;
}

export function drawPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.save();
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 3;
  ctx.strokeRect(TEX_W * 0.16, TEX_H * 0.26, TEX_W * 0.68, TEX_H * 0.48);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.font = "500 42px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VAŠ NATPIS OVDE", TEX_W / 2, TEX_H / 2);
  ctx.restore();
}

export function drawText(ctx: CanvasRenderingContext2D, o: DrawOptions) {
  const cx = TEX_W * o.posX;
  const cy = TEX_H * (1 - o.posY);
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.save();
  ctx.font = `600 ${o.fontSize * 1.6}px ${o.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Matirano staklo: mek oreol + citko jezgro
  ctx.shadowColor = "rgba(220,245,255,0.85)";
  ctx.shadowBlur = 26;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(o.text, cx, cy);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fillText(o.text, cx, cy);
  ctx.restore();
}

/**
 * Slika -> efekat peskarenja.
 * Tamni pikseli postaju matirano staklo (belo, neprovidno),
 * svetli postaju providni. Prag i inverzija su korisnicki podesivi.
 */
export function drawImageEtched(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  o: DrawOptions
) {
  const cx = TEX_W * o.posX;
  const cy = TEX_H * (1 - o.posY);

  const w = Math.max(1, Math.round(TEX_W * o.imageScale));
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));

  // Offscreen: skaliraj pa obradi piksele
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return;
  octx.drawImage(img, 0, 0, w, h);

  let data: ImageData;
  try {
    data = octx.getImageData(0, 0, w, h);
  } catch {
    // Tainted canvas (cross-origin) — fallback na obicno crtanje
    ctx.clearRect(0, 0, TEX_W, TEX_H);
    ctx.drawImage(off, cx - w / 2, cy - h / 2);
    return;
  }

  const px = data.data;
  const threshold = o.imageThreshold;

  for (let i = 0; i < px.length; i += 4) {
    const a0 = px[i + 3] / 255;
    // Luminanca (Rec. 709)
    const lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;

    // Tamno = gravirano; invert okrece odnos
    let etch = o.imageInvert ? lum : 1 - lum;

    // Mek prag oko threshold vrednosti -> cuva polutonove
    const edge = 0.28;
    etch = (etch - (1 - threshold) + edge / 2) / edge;
    etch = Math.min(1, Math.max(0, etch));

    px[i] = 255;
    px[i + 1] = 255;
    px[i + 2] = 255;
    px[i + 3] = Math.round(etch * a0 * 245);
  }

  octx.putImageData(data, 0, 0);

  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.save();
  ctx.shadowColor = "rgba(210,240,255,0.5)";
  ctx.shadowBlur = 10;
  ctx.drawImage(off, cx - w / 2, cy - h / 2);
  ctx.restore();
}
