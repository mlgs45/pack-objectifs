export const DEPARTEMENTS = [
  { code: "18", nom: "Cher" },
  { code: "28", nom: "Eure-et-Loir" },
  { code: "36", nom: "Indre" },
  { code: "37", nom: "Indre-et-Loire" },
  { code: "41", nom: "Loir-et-Cher" },
  { code: "45", nom: "Loiret" },
] as const;

export type DepartementCode = (typeof DEPARTEMENTS)[number]["code"];

export function getDepartementNom(code: string): string {
  return DEPARTEMENTS.find((d) => d.code === code)?.nom ?? code;
}
