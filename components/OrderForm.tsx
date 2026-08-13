"use client";
import { useState } from "react";
import { useConfigurator } from "@/store/configurator";
import styles from "./OrderForm.module.css";

type Status = "idle" | "loading" | "success" | "error";

export function OrderForm() {
  const { mode, text, fontFamily, fontSize, posX, posY, imageDataUrl, imageScale } =
    useConfigurator();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const hasEngraving =
    (mode === "text" && text.trim().length > 0) ||
    (mode === "image" && imageDataUrl !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasEngraving) {
      setErrMsg("Molimo dodajte tekst ili sliku pre poručivanja.");
      return;
    }
    setStatus("loading");
    setErrMsg(null);

    const engraving = {
      mode,
      ...(mode === "text" ? { text, fontFamily, fontSize } : { imageDataUrl, imageScale }),
      posX,
      posY,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, address, engraving }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Greška");
      setOrderId(data.orderId);
      setStatus("success");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Neočekivana greška.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>🥂</div>
        <h3 className={styles.successTitle}>Porudžbina primljena!</h3>
        <p className={styles.successSub}>
          Kontaktiraćemo vas uskoro. ID porudžbine:{" "}
          <code className={styles.orderId}>{orderId}</code>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {!hasEngraving && (
        <div className={styles.warning}>
          ⚠️ Niste dodali graviranje. Dodajte tekst ili sliku iznad.
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="fullName">Ime i prezime</label>
        <input
          id="fullName"
          className={styles.input}
          type="text"
          placeholder="Marko Marković"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="address">Adresa dostave</label>
        <textarea
          id="address"
          className={styles.textarea}
          placeholder="Ul. Bulevar Revolucije 10, Beograd 11000"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={3}
        />
      </div>

      {errMsg && <p className={styles.error}>{errMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className={styles.submitBtn}
      >
        {status === "loading" ? "Šaljem porudžbinu..." : "🥂 Poruči — jedan klik"}
      </button>
    </form>
  );
}
