import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Amauta</h1>
        <p className={styles.subtitle}>Sistema Educativo</p>

        <div className={styles.status}>
          <span className={styles.badge}>En desarrollo</span>
        </div>

        <p className={styles.description}>
          Plataforma de gestión del aprendizaje diseñada para facilitar la
          educación moderna.
        </p>

        <div className={styles.links}>
          <a
            href="https://github.com/your-org/amauta"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <span className={styles.separator}>·</span>
          <a href="/docs" className={styles.link}>
            Documentación
          </a>
        </div>
      </div>
    </main>
  );
}
