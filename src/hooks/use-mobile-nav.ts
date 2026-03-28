"use client";

import { useState } from "react";

export function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((currentValue) => !currentValue),
  };
}
