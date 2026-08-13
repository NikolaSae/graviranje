"use client";
import { useRef, useState } from "react";
import { useConfigurator, Mode } from "@/store/configurator";
import { GLASS_LIST, GlassType } from "@/lib/glassModels";
import styles from "./EditorPanel.module.css";

const FONTS = [
  { label: "Klasičan serif", value: "Georgia, serif" },
  { label: "Moderan sans", value: "Arial, Helvetica, sans-serif" },
  { label: "Elegantni", value: "'Palatino Linotype', Palatino, serif" },
  { label: "Tehnički mono", value: "'Courier New', monospace" },
  { label: "Rukopis", value: "'Segoe Script', 'Brush Script MT', cursive" },
];

const MAX_UPLOAD = 8 * 1024 * 1024;
const MAX_DIM = 1200;

/** Smanji sliku pre cuvanja — sprecava ogroman base64 u bazi i localStorage. */
function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Ne mogu da pročitam fajl."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Neispravan format slike."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        if (scale === 1 && (reader.result as string).length < 400_000) {
          resolve(reader.result as string);
          return;
        }
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("Canvas nije dostupan."));
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function EditorPanel() {
  const {
    glassType, setGlassType,
    mode, setMode,
    text, setText,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    posX, setPosX,
    posY, setPosY,
    imageDataUrl, setImageDataUrl,
    imageScale, setImageScale,
    imageThreshold, setImageThreshold,
    imageInvert, setImageInvert,
  } = useConfigurator();

  const fileRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function acceptFile(file: File | undefined) {
    setImgError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError("Fajl nije slika.");
      return;
    }
    if (file.size > MAX_UPLOAD) {
      setImgError("Slika je veća od 8 MB.");
      return;
    }
    try {
      setImageDataUrl(await downscaleImage(file));
    } catch (e) {
      setImgError(e instanceof Error ? e.message : "Greška pri učitavanju.");
    }
  }

  return (
    <div className={styles.panel}>
      {/* ── Izbor case ── */}
      <div className={styles.fields}>
        <label className={styles.label}>Model čaše</label>
        <div className={styles.glassGrid}>
          {GLASS_LIST.map((g) => (
            <button
              key={g.id}
              type="button"
              className={styles.glassChip}
              aria-pressed={glassType === g.id}
              onClick={() => setGlassType(g.id as GlassType)}
              title={g.hint}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Tabovi ── */}
      <div className={styles.tabs} role="tablist">
        {(["text", "image"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={styles.tab}
          >
            {m === "text" ? "Tekst" : "Slika"}
          </button>
        ))}
      </div>

      {/* ── Tekst ── */}
      {mode === "text" && (
        <div className={styles.fields}>
          <label className={styles.label} htmlFor="engText">Vaš natpis</label>
          <input
            id="engText"
            className={styles.input}
            type="text"
            placeholder="npr. Ana & Marko"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={40}
          />
          <span className={styles.hint}>{text.length}/40 znakova</span>

          <label className={styles.label} htmlFor="engFont">Font</label>
          <select
            id="engFont"
            className={styles.select}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{ fontFamily }}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>

          <label className={styles.label}>Veličina: {fontSize}px</label>
          <input
            className={styles.range}
            type="range" min={32} max={120} step={4}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
      )}

      {/* ── Slika ── */}
      {mode === "image" && (
        <div className={styles.fields}>
          <div
            className={`${styles.dropzone} ${imageDataUrl ? styles.hasImage : ""} ${dragOver ? styles.dragOver : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
          >
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageDataUrl} alt="Pregled" className={styles.preview} />
            ) : (
              <>
                <span className={styles.dropIcon}>↑</span>
                <span>Prevucite sliku ili kliknite</span>
                <span className={styles.hint}>PNG, JPG, SVG · do 8 MB</span>
              </>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept="image/*"
            className={styles.hidden}
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          {imgError && <span className={styles.errorText}>{imgError}</span>}

          {imageDataUrl && (
            <>
              <label className={styles.label}>Veličina: {Math.round(imageScale * 100)}%</label>
              <input
                className={styles.range} type="range" min={0.1} max={0.9} step={0.05}
                value={imageScale}
                onChange={(e) => setImageScale(Number(e.target.value))}
              />

              <label className={styles.label}>
                Jačina graviranja: {Math.round(imageThreshold * 100)}%
              </label>
              <input
                className={styles.range} type="range" min={0.15} max={0.95} step={0.05}
                value={imageThreshold}
                onChange={(e) => setImageThreshold(Number(e.target.value))}
              />

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={imageInvert}
                  onChange={(e) => setImageInvert(e.target.checked)}
                />
                <span>Obrni (za tamne pozadine)</span>
              </label>

              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { setImageDataUrl(null); setImgError(null); }}
              >
                Ukloni sliku
              </button>
            </>
          )}
        </div>
      )}

      <div className={styles.divider} />

      {/* ── Pozicija ── */}
      <div className={styles.fields}>
        <label className={styles.label}>Levo / desno: {Math.round(posX * 100)}%</label>
        <input
          className={styles.range} type="range" min={0.15} max={0.85} step={0.01}
          value={posX}
          onChange={(e) => setPosX(Number(e.target.value))}
        />
        <label className={styles.label}>Gore / dole: {Math.round(posY * 100)}%</label>
        <input
          className={styles.range} type="range" min={0.15} max={0.85} step={0.01}
          value={posY}
          onChange={(e) => setPosY(Number(e.target.value))}
        />
      </div>

      <a href="#porudzbina" className={styles.ctaBtn}>Poruči sada →</a>
    </div>
  );
}
