"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div className="absolute top-4 right-4">
      <Switch
        id="theme"
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}