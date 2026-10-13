import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { useColorMode } from "@docusaurus/theme-common";
import { useDocsVersion } from "@docusaurus/plugin-content-docs/client";
import type { SandpackFile } from "@codesandbox/sandpack-react";

interface HookPlaygroundProps {
  code: string;
  extraFiles?: Record<string, SandpackFile | string>;
  previewHeight?: number;
  showConsole?: boolean;
}

/**
 * Resolves the npm dependencies for the docs version being viewed, so each
 * versioned page runs against the library release it documents.
 */
function getDependencies(docsVersion: string): Record<string, string> {
  // "current" is the unreleased "Next" docs: run against the newest release
  if (docsVersion === "current") {
    return { react: "^19.0.0", "react-dom": "^19.0.0", "@julianfere/hooked": "latest" };
  }

  const major = Number(docsVersion.split(".")[0]);
  const react = major >= 1 ? "^19.0.0" : "^18.3.1";

  return { react, "react-dom": react, "@julianfere/hooked": docsVersion };
}

function Playground({
  code,
  extraFiles = {},
  previewHeight = 320,
  showConsole = false,
  dependencies,
}: HookPlaygroundProps & { dependencies: Record<string, string> }) {
  const { colorMode } = useColorMode();

  return (
    <div className="sandpack-wrapper">
      <SandpackProvider
        template="react-ts"
        theme={colorMode === "dark" ? "dark" : "light"}
        customSetup={{
          dependencies,
        }}
        files={{
          "/App.tsx": { code, active: true },
          ...extraFiles,
        }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: previewHeight }}
          />
          <SandpackPreview
            showNavigator={false}
            style={{ height: previewHeight }}
          />
        </SandpackLayout>
        {showConsole && <SandpackConsole />}
      </SandpackProvider>
    </div>
  );
}

export default function HookPlayground(props: HookPlaygroundProps) {
  const { version } = useDocsVersion();
  const dependencies = getDependencies(version);

  return (
    <BrowserOnly fallback={<div>Loading playground...</div>}>
      {() => <Playground {...props} dependencies={dependencies} />}
    </BrowserOnly>
  );
}
