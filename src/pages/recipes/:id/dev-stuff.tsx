import DevOnly from '@/components/dev-only';
import { Button } from '@/components/ui/button';
import { deleteRecipe, postNewRecipe } from '@/lib/recipe';
import { useRecipes, useTags } from '@/lib/selectors';
import { Account, Recipe } from '@/schema';
import { useAccount } from 'jazz-tools/react';
import { useLocation } from 'wouter';
import React, { useState } from 'react';
import { CheckmarkIcon, CopyIcon } from '@/components/ui/inons';

// Table for showing all fields of a Recipe
const DevRecipeTable = ({ recipe }: { recipe: Recipe }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(
        () => setCopiedKey((prev) => (prev === key ? null : prev)),
        1200,
      );
    } catch (e) {
      // Optionally handle error
    }
  };

  return (
    <table className="text-xs border border-slate-200 rounded w-full mb-4">
      <tbody>
        {Object.entries(recipe).map(([key, value]) => {
          let displayValue: string;
          if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value, null, 2);
          } else {
            displayValue = String(value);
          }
          const isLong = displayValue.length > 1000;
          const isExpanded = expanded[key];
          return (
            <tr key={key} className="border-b last:border-b-0">
              <td className="px-2 py-1 font-mono text-muted-foreground align-top whitespace-nowrap min-w-[120px]">
                {key}
              </td>
              <td className="px-2 py-1 font-mono break-all align-top relative group">
                {isLong ? (
                  <div className="flex items-start">
                    <button
                      className="mr-2 align-middle inline-block opacity-70 hover:opacity-100 transition-opacity mt-0.5"
                      title="Copy to clipboard"
                      onClick={() => handleCopy(key, displayValue)}
                      aria-label="Copy to clipboard"
                      type="button"
                    >
                      {copiedKey === key ? <CheckmarkIcon /> : <CopyIcon />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <pre className="whitespace-pre-wrap break-all m-0 p-0 bg-transparent inline">
                        {isExpanded
                          ? displayValue
                          : displayValue.slice(0, 1000) + '...'}
                      </pre>
                      <button
                        className="ml-2 underline text-blue-600 cursor-pointer text-xs"
                        onClick={() => handleToggle(key)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <button
                      className="mr-2 align-middle inline-block opacity-70 hover:opacity-100 transition-opacity mt-0.5"
                      title="Copy to clipboard"
                      onClick={() => handleCopy(key, displayValue)}
                      aria-label="Copy to clipboard"
                      type="button"
                    >
                      {copiedKey === key ? (
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            stroke="#22c55e"
                            strokeWidth="2"
                            d="M4 8.5l3 3 5-5"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <rect
                            x="5"
                            y="5"
                            width="7"
                            height="7"
                            rx="1"
                            stroke="#64748b"
                            strokeWidth="1.5"
                          />
                          <rect
                            x="3"
                            y="3"
                            width="7"
                            height="7"
                            rx="1"
                            stroke="#64748b"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </button>
                    <pre className="whitespace-pre-wrap break-all m-0 p-0 bg-transparent inline">
                      {displayValue}
                    </pre>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const DevComponent = ({ recipe }: { recipe: Recipe }) => {
  const { me } = useAccount(Account);
  const recipes = useRecipes();
  const tags = useTags();
  const [, setLocation] = useLocation();

  return (
    <DevOnly>
      <DevRecipeTable recipe={recipe} />

      <Button
        onClick={() => {
          if (!me || !tags) {
            throw new Error('No account found');
          }
          postNewRecipe(me, recipe.url.toString(), recipe.id, tags.id);
        }}
      >
        Retry Server Worker
      </Button>
      <Button
        onClick={() => {
          deleteRecipe(recipes || [], recipe.id);
          setLocation('/');
        }}
        variant="destructive"
      >
        Delete Recipe
      </Button>
    </DevOnly>
  );
};

export default DevComponent;
