"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { EditorPanel } from "./EditorPanel";
import styles from "./Hero.module.css";

const GlassScene = dynamic(() => import("./GlassScene").then(m => ({ default: m.GlassScene })), {
  ssr: false,
  loading: () => (
    <div className={styles.canvasPlaceholder}>
      <div className={styles.loader} />
    </div>
  ),
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section className={styles.hero} ref={ref} id="konfigurator">
      {/* Kicker */}
      <div className={styles.kicker}>
        <span className={styles.dot} aria-hidden="true" />
        Personalizovano graviranje na staklu
      </div>

      {/* Naslov */}
      <h1 className={styles.heading}>
        <span className={styles.row}>
          <span>Vaša priča</span>
        </span>
        <span className={styles.row}>
          <em>na čaši</em>
        </span>
      </h1>

      {/* Subtitle */}
      <p className={styles.sub}>
        Ukucajte tekst ili prevucite sliku — vidite rezultat uživo.
        <br />
        Jedno dugme. Jedna porudžbina.
      </p>

      {/* Main layout: Editor + 3D Glass */}
      <div className={styles.stage}>
        <div className={styles.editorWrap}>
          <EditorPanel />
        </div>
        <div className={styles.canvasWrap}>
          <GlassScene />
        </div>
      </div>

      {/* Scroll cue */}
      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLabel}>Poruči ispod</span>
        <span className={styles.drip} />
      </div>
    </section>
  );
}
