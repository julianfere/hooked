import { useEffect, useRef } from "react";

let warned = false;

const warnDeprecated = () => {
  if (warned) return;
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;

  warned = true;
  console.warn(
    "[hooked] useDocumentTitle is deprecated and will be removed in 2.0. " +
      "React 19 supports rendering <title> from any component: " +
      "https://react.dev/reference/react-dom/components/title"
  );
};

/**
 * @deprecated React 19 supports rendering `<title>` from any component, which React hoists
 * into the document `<head>`. Render `<title>{title}</title>` instead.
 * This hook will be removed in 2.0.
 */
const useDocumentTitle = (title: string, persistOnUnmount: boolean = false) => {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    warnDeprecated();
  }, []);

  useEffect(() => {
    document.title = title;

    return () => {
      if (!persistOnUnmount) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        document.title = defaultTitle.current;
      }
    };
  }, [persistOnUnmount, title]);
};

export default useDocumentTitle;
