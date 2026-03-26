"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  saving: boolean;
  lastSaved?: Date | null;
}

export function AutoSaveIndicator({ saving, lastSaved }: AutoSaveIndicatorProps) {
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
    if (saving) {
      setDisplay("Sauvegarde...");
      return;
    }
    if (lastSaved) {
      const update = () => {
        const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
        if (diff < 5) setDisplay("Sauvegardé à l'instant");
        else if (diff < 60) setDisplay(`Sauvegardé il y a ${diff}s`);
        else setDisplay(`Sauvegardé il y a ${Math.floor(diff / 60)}min`);
      };
      update();
      const interval = setInterval(update, 5000);
      return () => clearInterval(interval);
    }
  }, [saving, lastSaved]);

  if (!saving && !lastSaved) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {saving ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Check className="h-3 w-3 text-success" />
      )}
      <span>{display}</span>
    </div>
  );
}
