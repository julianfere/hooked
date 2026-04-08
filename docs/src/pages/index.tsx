import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

const hooks = [
  {
    name: "useAsync",
    color: "var(--hooked-blue)",
    description:
      "Manage async function lifecycle with idle, pending, fulfilled, and rejected states.",
  },
  {
    name: "useDebounce",
    color: "var(--hooked-mauve)",
    description: "Delay value updates until the user stops typing.",
  },
  {
    name: "useThrottle",
    color: "var(--hooked-green)",
    description:
      "Limit how often a value can change with leading-edge semantics.",
  },
  {
    name: "useDelay",
    color: "var(--hooked-peach)",
    description: "Execute a callback after a configurable delay.",
  },
  {
    name: "useDocumentTitle",
    color: "var(--hooked-sky)",
    description: "Set and restore the document title declaratively.",
  },
  {
    name: "useLocalStorage",
    color: "var(--hooked-teal)",
    description:
      "Typed local storage operations with automatic JSON serialisation.",
  },
  {
    name: "useQueryParams",
    color: "var(--hooked-red)",
    description: "Read and write URL query parameters with full type safety.",
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
    <Link to={`/docs/hooks/${name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}`} className={styles.hookCard}>
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
          Type-safe, functional React hooks — small, focused, and tested.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro"
          >
            Get Started
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
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main className={styles.main}>
        <div className="container">
          <Heading as="h2" className={styles.sectionTitle}>
            All hooks
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
