import { useMemo, useState } from "react";
import XIcon from "../assets/xmark-solid.svg?react"; // swap to your close icon if needed

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type BloomLevel = {
  level: string;
  description: string;
  verbs: string[];
};

const BLOOMS: BloomLevel[] = [
  {
    level: "Remember",
    description: "Recall facts and basic concepts.",
    verbs: [
      "define","list","recall","identify","label","recognize","name",
      "state","select","match","memorize","repeat"
    ],
  },
  {
    level: "Understand",
    description: "Explain ideas or concepts.",
    verbs: [
      "describe","explain","summarize","classify","compare","interpret",
      "paraphrase","infer","illustrate","discuss","predict","give examples"
    ],
  },
  {
    level: "Apply",
    description: "Use information in new situations.",
    verbs: [
      "use","execute","implement","solve","demonstrate","calculate",
      "perform","operate","employ","practice","modify","compute"
    ],
  },
  {
    level: "Analyze",
    description: "Draw connections among ideas.",
    verbs: [
      "differentiate","organize","attribute","contrast","examine","test",
      "categorize","investigate","diagram","break down","compare","deconstruct"
    ],
  },
  {
    level: "Evaluate",
    description: "Justify a decision or course of action.",
    verbs: [
      "check","critique","judge","justify","appraise","argue",
      "defend","assess","rate","recommend","validate","prioritize"
    ],
  },
  {
    level: "Create",
    description: "Produce new or original work.",
    verbs: [
      "design","construct","develop","formulate","generate","plan",
      "compose","produce","devise","invent","propose","synthesize"
    ],
  },
];

export default function BloomsGuidePopup({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOOMS;

    return BLOOMS.filter((lvl) =>
      lvl.verbs.some((v) => v.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-[92vw] max-w-3xl bg-white rounded-2xl shadow-xl border border-[#E9E6E6] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Bloom’s Taxonomy Guide</h2>
            <p className="text-xs text-gray-500">
              Type a verb to filter levels.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search verb (e.g., analyze, justify, design)"
          className="w-full h-10 px-3 mb-4 border border-[#E9E6E6] rounded-md outline-none focus:ring-2 focus:ring-black/10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="max-h-[60vh] overflow-y-auto border border-[#E9E6E6] rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-[#E9E6E6]">
              <tr>
                <th className="text-left px-3 py-2 w-32">Level</th>
                <th className="text-left px-3 py-2 w-56">Meaning</th>
                <th className="text-left px-3 py-2">Correlated verbs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                    No verbs found for “{query}”.
                  </td>
                </tr>
              ) : (
                filtered.map((lvl) => {
                  const q = query.trim().toLowerCase();
                  const shownVerbs =
                    q
                      ? lvl.verbs.filter((v) => v.toLowerCase().includes(q))
                      : lvl.verbs;

                  return (
                    <tr key={lvl.level} className="border-b border-[#E9E6E6] last:border-b-0">
                      <td className="px-3 py-3 font-medium">{lvl.level}</td>
                      <td className="px-3 py-3 text-gray-700">{lvl.description}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {shownVerbs.map((v) => (
                            <span
                              key={v}
                              className="px-2 py-0.5 rounded-full border border-[#E9E6E6] bg-white text-xs"
                            >
                              {v}
                            </span>
                          ))}
                          {q && shownVerbs.length === 0 && (
                            <span className="text-xs text-gray-400">
                              (no matching verbs; clear search to view all)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
}
