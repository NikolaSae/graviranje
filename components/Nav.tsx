"use client";
import { useSession, signOut } from "@/lib/auth-client";
import styles from "./Nav.module.css";

export function Nav() {
  const { data: session } = useSession();

  return (
    <header className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span>GRAVIRANJE</span>
      </div>
      <nav className={styles.links}>
        <a href="#konfigurator">Konfigurator</a>
        <a href="#porudzbina">Poruči</a>
      </nav>
      <div className={styles.auth}>
        {session ? (
          <>
            <span className={styles.email}>{session.user.email}</span>
            <button onClick={() => signOut()} className={styles.signOutBtn}>
              Odjava
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
