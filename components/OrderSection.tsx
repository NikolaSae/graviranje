"use client";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AuthModal } from "./AuthModal";
import { OrderForm } from "./OrderForm";
import styles from "./OrderSection.module.css";

export function OrderSection() {
  const { data: session, isPending } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <section className={styles.section} id="porudzbina">
      <div className={styles.inner}>
        {/* Section head */}
        <div className={styles.head}>
          <span className={styles.num}>02</span>
          <div>
            <h2 className={styles.title}>Završite porudžbinu</h2>
            <p className={styles.sub}>
              Popunite podatke za dostavu — bez naloga, bez komplikacija.
            </p>
          </div>
        </div>

        {/* Auth / Order form */}
        {isPending ? (
          <div className={styles.loading}>Učitavanje...</div>
        ) : session ? (
          <OrderForm />
        ) : (
          <div className={styles.authWall}>
            <p className={styles.authHint}>
              Potvrdite email adresu da bismo vam mogli dostaviti porudžbinu.
            </p>
            <button className={styles.authBtn} onClick={() => setShowAuth(true)}>
              Potvrdi email →
            </button>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </section>
  );
}
