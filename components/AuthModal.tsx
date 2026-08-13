"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthModal.module.css";

interface Props { onClose: () => void; }

type Step = "email" | "sent";

export function AuthModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/?order=1",
      });
      if (result.error) throw new Error(result.error.message);
      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal aria-label="Potvrda emaila">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Zatvori">✕</button>

        {step === "email" ? (
          <>
            <div className={styles.icon}>✉️</div>
            <h3 className={styles.title}>Unesite vašu email adresu</h3>
            <p className={styles.sub}>
              Poslaćemo vam link za potvrdu. Bez lozinke, bez naloga.
            </p>
            <form onSubmit={handleSend} className={styles.form}>
              <input
                className={styles.emailInput}
                type="email"
                placeholder="vaseime@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Šaljem..." : "Pošalji magic link →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className={styles.icon}>🎉</div>
            <h3 className={styles.title}>Proverite inbox!</h3>
            <p className={styles.sub}>
              Poslali smo link na <strong>{email}</strong>.
              <br />
              Kliknite na njega da završite porudžbinu.
            </p>
            <button className={styles.secondaryBtn} onClick={onClose}>
              Zatvori
            </button>
          </>
        )}
      </div>
    </div>
  );
}
