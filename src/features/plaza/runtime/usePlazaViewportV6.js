import { useLayoutEffect } from "react";

// Route-owned viewport: preserve the app scroll/styles when Plaza is closed.
export function mountPlazaViewportV6(win, doc) {
  const root = doc.documentElement, body = doc.body;
  const saved = [root.style.overflow, body.style.overflow, body.style.overscrollBehavior];
  const keys = ["--plaza-viewport-height", "--plaza-viewport-top", "--plaza-chat-height", "--plaza-chat-top"];
  let fullHeight = win.visualViewport?.height || win.innerHeight;
  let fullWidth = win.innerWidth;
  const variables = keys.map(key => [root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]);
  const scroll = [win.scrollX, win.scrollY];
  const update = () => {
    const viewport = win.visualViewport;
    const editing = doc.activeElement?.matches?.("input,textarea,[contenteditable=true]");
    const height = viewport?.height || win.innerHeight;
    const rotated = fullWidth !== win.innerWidth;
    if (rotated || (!editing && height > fullHeight * .75)) { fullHeight = height; fullWidth = win.innerWidth; }
    root.style.setProperty(keys[0], `${fullHeight}px`);
    root.style.setProperty(keys[1], "0px");
    root.style.setProperty(keys[2], `${height}px`);
    root.style.setProperty(keys[3], `${viewport?.offsetTop || 0}px`);
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
