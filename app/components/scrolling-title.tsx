"use client";

import { useEffect } from "react";

export function ScrollingTitle({ text }: { text: string }) {
  useEffect(() => {
    let currentTitle = text + "      ";
    const interval = setInterval(() => {
      currentTitle = currentTitle.substring(1) + currentTitle[0];
      document.title = currentTitle;
    }, 350);

    return () => clearInterval(interval);
  }, [text]);

  return null;
}
