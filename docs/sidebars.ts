import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Hooks",
      collapsed: false,
      items: [
        "hooks/use-async",
        "hooks/use-debounce",
        "hooks/use-throttle",
        "hooks/use-delay",
        "hooks/use-document-title",
        "hooks/use-local-storage",
        "hooks/use-query-params",
      ],
    },
    {
      type: "category",
      label: "Advanced",
      items: ["advanced/event-context"],
    },
  ],
};

export default sidebars;
