"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // The theme is only known on the client, so render nothing until mounted
  // to avoid showing the wrong switch position (and a hydration mismatch).
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute top-4 right-4">
      <Switch
        id="theme"
        aria-label="Toggle dark mode"
        checked={resolvedTheme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}
