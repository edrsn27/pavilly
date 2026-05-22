"use client";

import { useRef } from "react";
import styles from "./TextTruncate.module.css";

interface TextTruncateProps {
  text: string;
  /** Applied to the wrapper — use it for max-width, font-weight, color (inherits). */
  className?: string;
}

export function TextTruncate({ text, className }: TextTruncateProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  function handleMouseEnter() {
    const el = textRef.current;
    if (el && el.scrollWidth > el.offsetWidth) {
      wrapperRef.current?.setAttribute("data-tip", "");
    }
  }

  function handleMouseLeave() {
    wrapperRef.current?.removeAttribute("data-tip");
  }

  return (
    <span
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      data-tooltip={text}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={textRef} className={styles.text}>
        {text}
      </span>
    </span>
  );
}
