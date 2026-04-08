import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Hooked",
  tagline: "Type-safe, functional React hooks",
  favicon: "img/favicon.svg",

  future: {
    v4: true,
  },

  url: "https://hooked.fere.com.ar",
  baseUrl: "/",

  organizationName: "julianfere",
  projectName: "hooked",
  trailingSlash: false,

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    localeConfigs: {
      en: { label: "English", direction: "ltr" },
      es: { label: "Español", direction: "ltr" },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/julianfere/hooked/edit/main/docs/",
          lastVersion: "0.2.0",
          versions: {
            current: {
              label: "Next (Unreleased)",
              path: "next",
              banner: "unreleased",
            },
            "0.2.0": {
              label: "0.2.0",
              path: "/",
              badge: true,
            },
            "0.1.0": {
              label: "0.1.0",
              badge: true,
            },
          },
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Hooked",
      logo: {
        alt: "Hooked Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/julianfere/hooked",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "/docs/intro" },
          ],
        },
        {
          title: "More",
          items: [
            { label: "GitHub", href: "https://github.com/julianfere/hooked" },
            {
              label: "npm",
              href: "https://www.npmjs.com/package/@julianfere/hooked",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Julian Fere. MIT License.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "typescript", "tsx"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
