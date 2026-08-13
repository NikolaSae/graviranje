"use client";
import { useRef } from "react";
import { useConfigurator, Mode } from "@/store/configurator";
import styles from "./EditorPanel.module.css";

const FONTS = [
  { label: "Serif (klasičan)", value: "Georgia, serif" },
  { label: "Sans-serif (moderan)", value: "Arial, sans-serif" },
  { label: "Kursiv (elegantni)", value: "Palatino Linotype, serif" },
  { label: "Mono (tehnikal)", value: "Courier New, monospace" },
];

export function EditorPanel() {
  const {
    mode, setMode,
    text, setText,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    posX, setPosX,
    posY, setPosY,
    imageDataUrl, setImageDataUrl,
    imageScale, setImageScale,
  } = useConfigurator();

  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.panel}>
      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {(["text", "image"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={styles.tab}
          >
            {m === "text" ? "✏️ Tekst" : "🖼️ Slika"}
          </button>
        ))}
      </div>

      {/* Text tab */}
      {mode === "text" && (
        <div className={styles.fields}>
          <label className={styles.label}>Vaš natpis</label>
          <input
            className={styles.input}
            type="text"
            placeholder="npr. Ana & Marko"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={40}
          />
          <span className={styles.hint}>{text.length}/40 znakova</span>

          <label className={styles.label}>Font</label>
          <select
            className={styles.select}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
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

      {/* Image tab */}
      {mode === "image" && (
        <div className={styles.fields}>
          <div
            className={`${styles.dropzone} ${imageDataUrl ? styles.hasImage : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            onClick={() => fileRef.current?.click()}
          >
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageDataUrl} alt="Preview" className={styles.preview} />
            ) : (
              <>
                <span className={styles.dropIcon}>⬆️</span>
                <span>Prevucite sliku ili kliknite</span>
                <span className={styles.hint}>PNG, JPG, SVG</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className={styles.hidden} onChange={handleImagePick} />

          {imageDataUrl && (
            <>
              <label className={styles.label}>Veličina: {Math.round(imageScale * 100)}%</label>
              <input
                className={styles.range} type="range" min={0.1} max={0.9} step={0.05}
                value={imageScale}
                onChange={(e) => setImageScale(Number(e.target.value))}
              />
              <button className={styles.clearBtn} onClick={() => setImageDataUrl(null)}>
                Ukloni sliku
              </button>
            </>
          )}
        </div>
      )}

      {/* Position controls (both modes) */}
      <div className={styles.fields} style={{ marginTop: "0.5rem" }}>
        <label className={styles.label}>Pozicija levo/desno: {Math.round(posX * 100)}%</label>
        <input
          className={styles.range} type="range" min={0.1} max={0.9} step={0.01}
          value={posX}
          onChange={(e) => setPosX(Number(e.target.value))}
        />
        <label className={styles.label}>Pozicija gore/dole: {Math.round(posY * 100)}%</label>
        <input
          className={styles.range} type="range" min={0.1} max={0.9} step={0.01}
          value={posY}
          onChange={(e) => setPosY(Number(e.target.value))}
        />
      </div>

      <a href="#porudzbina" className={styles.ctaBtn}>
        Poruči sada →
      </a>
    </div>
  );
}
