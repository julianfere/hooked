import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "@site/src/pages/index.module.css";

const hooks = [
  {
    name: "useAsync",
    color: "var(--hooked-blue)",
    description:
      "Gestiona el ciclo de vida de funciones asíncronas: idle, pending, fulfilled y rejected.",
  },
  {
    name: "useDebounce",
    color: "var(--hooked-mauve)",
    description: "Retrasa la actualización de un valor hasta que el usuario deja de escribir.",
  },
  {
    name: "useThrottle",
    color: "var(--hooked-green)",
    description: "Limita la frecuencia de cambios con semántica de borde inicial.",
  },
  {
    name: "useDelay",
    color: "var(--hooked-peach)",
    description: "Ejecuta un callback después de un retardo configurable.",
  },
  {
    name: "useDocumentTitle",
    color: "var(--hooked-sky)",
    description: "Establece y restaura el título del documento de forma declarativa.",
  },
  {
    name: "useLocalStorage",
    color: "var(--hooked-teal)",
    description: "Acceso tipado a localStorage con serialización JSON automática.",
  },
  {
    name: "useQueryParams",
    color: "var(--hooked-red)",
    description: "Lee y escribe parámetros de URL con tipado completo.",
  },
];

function HookCard({
  name,
  color,
  description,
}: {
  name: string;
  color: string;
  description: string;
}) {
  return (
    <Link
      to={`/docs/hooks/${name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}`}
      className={styles.hookCard}
    >
      <span className={styles.hookName} style={{ color }}>
        {name}
      </span>
      <p className={styles.hookDesc}>{description}</p>
    </Link>
  );
}

function HomepageHeader() {
  return (
    <header className={`hero hero--hooked ${styles.heroBanner}`}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Hooked
        </Heading>
        <p className="hero__subtitle">
          React hooks con tipado estricto — pequeños, enfocados y testeados.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Primeros pasos
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/julianfere/hooked"
            style={{ marginLeft: "1rem" }}
          >
            GitHub
          </Link>
        </div>
        <div className={styles.installBlock}>
          <code>npm install @julianfere/hooked</code>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="React hooks con tipado estricto">
      <HomepageHeader />
      <main className={styles.main}>
        <div className="container">
          <Heading as="h2" className={styles.sectionTitle}>
            Todos los hooks
          </Heading>
          <div className={styles.hookGrid}>
            {hooks.map((h) => (
              <HookCard key={h.name} {...h} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
