"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowToPlayProps {
  gridSize: number;
  mines: number;
}

export function HowToPlay({ gridSize, mines }: HowToPlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="How to play"
        title="How to play"
        onClick={() => dialogRef.current?.showModal()}
      >
        ?
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="how-to-play-title"
        // Clicking the backdrop (outside the panel) closes the dialog
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="w-[min(28rem,calc(100vw-2rem))] rounded-lg border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="how-to-play-title" className="text-xl font-bold">
              How to play
            </h2>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
              <X />
            </Button>
          </div>

          <p className="mb-3">
            The {gridSize}×{gridSize} grid hides {mines} mines. Reveal every safe cell without
            hitting one.
          </p>

          <ul className="mb-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Dig:</strong> click or tap a cell to reveal it.
            </li>
            <li>
              <strong>Flag:</strong> right-click, or press and hold a cell, to mark a suspected
              mine. Do it again to remove the flag.
            </li>
            <li>
              <strong>Tap to dig / Tap to flag:</strong> this button switches what a normal tap
              does, which is handy on phones.
            </li>
            <li>
              <strong>Numbers</strong> show how many of the 8 surrounding cells contain mines.
              An empty cell has none, so its neighbours open up automatically.
            </li>
          </ul>

          <p>You win when every safe cell is revealed. Dig up a mine and it&apos;s game over.</p>
        </div>
      </dialog>
    </>
  );
}
