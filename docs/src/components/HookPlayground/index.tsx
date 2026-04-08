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
import type { SandpackFile } from "@codesandbox/sandpack-react";

interface HookPlaygroundProps {
  code: string;
  extraFiles?: Record<string, SandpackFile | string>;
  previewHeight?: number;
  showConsole?: boolean;
}

function Playground({
  code,
  extraFiles = {},
  previewHeight = 320,
  showConsole = false,
}: HookPlaygroundProps) {
  const { colorMode } = useColorMode();

  return (
    <div className="sandpack-wrapper">
      <SandpackProvider
        template="react-ts"
        theme={colorMode === "dark" ? "dark" : "light"}
        customSetup={{
          dependencies: {
            // Pin React versions explicitly to prevent duplicate React instances
            // (@julianfere/hooked has react as a regular dep, not peerDep)
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "@julianfere/hooked": "latest",
          },
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
  return (
    <BrowserOnly fallback={<div>Loading playground...</div>}>
      {() => <Playground {...props} />}
    </BrowserOnly>
  );
}
