"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { filterSuggestions } from "@/lib/data/marques";

/**
 * Champ texte avec autocomplétion fuzzy :
 * - L'utilisateur tape librement, les suggestions s'affichent en dropdown
 * - Le filtrage ignore les accents ("bene" trouve "Bénéteau")
 * - L'utilisateur peut cliquer une suggestion OU taper une valeur non listée
 *   (saisie libre conservée — règle `feedback_nautilus_preselect_plus_libre`)
 */
export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  id,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  maxLength?: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme la dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = filterSuggestions(suggestions, value);
  const showDropdown = open && filtered.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted text-sm"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
