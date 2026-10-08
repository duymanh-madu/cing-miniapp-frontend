import { useLayoutEffect } from "react";

// Route-owned viewport: preserve the app scroll/styles when Plaza is closed.
export function mountPlazaViewportV6(win, doc) {
  const root = doc.documentElement, body = doc.body;
  const saved = [root.style.overflow, body.style.overflow, body.style.overscrollBehavior];
  const keys = ["--plaza-viewport-height", "--plaza-viewport-top"];
  const variables = keys.map(key => [root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]);
  const scroll = [win.scrollX, win.scrollY];
  const update = () => {
    const viewport = win.visualViewport;
    root.style.setProperty(keys[0], `${viewport?.height || win.innerHeight}px`);
    root.style.setProperty(keys[1], `${viewport?.offsetTop || 0}px`);
  };
  root.style.overflow = "hidden"; body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  update();
  win.addEventListener("resize", update);
  win.visualViewport?.addEventListener("resize", update);
  win.visualViewport?.addEventListener("scroll", update);
  return () => {
    win.removeEventListener("resize", update);
    win.visualViewport?.removeEventListener("resize", update);
    win.visualViewport?.removeEventListener("scroll", update);
    [root.style.overflow, body.style.overflow, body.style.overscrollBehavior] = saved;
    keys.forEach((key, i) => variables[i][0] ? root.style.setProperty(key, ...variables[i]) : root.style.removeProperty(key));
    win.scrollTo(...scroll);
  };
}
export function usePlazaViewportV6() {
  useLayoutEffect(() => mountPlazaViewportV6(window, document), []);
}
