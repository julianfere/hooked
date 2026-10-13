import { useSyncExternalStore } from "react";
import { castValue, serializeValue } from "./utils";

const LOCATION_CHANGE = "hooked:locationchange";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCATION_CHANGE, onChange);

  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCATION_CHANGE, onChange);
  };
};

const getPathname = () => window.location.pathname;
const getSearch = () => window.location.search;
const getServerSnapshot = () => "";

const splitHash = (url: string): [string, string] => {
  const index = url.indexOf("#");
  return index === -1 ? [url, ""] : [url.slice(0, index), url.slice(index)];
};

const replace = (url: string) => {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(LOCATION_CHANGE));
};

const useQueryParams = <TQuery extends Record<string, any>>() => {
  const pathname = useSyncExternalStore(subscribe, getPathname, getServerSnapshot);
  const search = useSyncExternalStore(subscribe, getSearch, getServerSnapshot);

  const get = (...keys: (keyof TQuery)[]) => {
    const params: Partial<TQuery> = {};
    const searchParams = new URLSearchParams(window.location.search);

    keys.forEach((key) => {
      const value = searchParams.get(key.toString());

      if (value) {
        params[key] = castValue<TQuery[keyof TQuery]>(value);
      }
    });

    return params;
  };

  const build = (params: Partial<TQuery>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      searchParams.set(key, serializeValue(value));
    });

    return searchParams.toString();
  };

  const set = (params: Partial<TQuery>, url?: string) => {
    const query = build(params);
    const [target, hash] = splitHash(url ?? window.location.href);
    const base = target.split("?")[0];

    replace(query ? `${base}?${query}${hash}` : `${base}${hash}`);
  };

  const clear = () => {
    replace(`${window.location.pathname}${window.location.hash}`);
  };

  return { get, set, build, pathname, search, clear };
};

export default useQueryParams;
