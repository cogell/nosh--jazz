import DevOnly from '@/components/dev-only';
import { Button } from '@/components/ui/button';
import { deleteRecipe, postNewRecipe } from '@/lib/recipe';
import { useRecipes } from '@/lib/selectors';
import { Account, Recipe } from '@/schema';
import { useAccount } from 'jazz-tools/react';
import { useLocation } from 'wouter';
import React, { useState } from 'react';

// Table for showing all fields of a Recipe
const DevRecipeTable = ({ recipe }: { recipe: Recipe }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
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
              <td className="px-2 py-1 font-mono break-all align-top">
                {isLong ? (
                  <div>
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
                ) : (
                  <pre className="whitespace-pre-wrap break-all m-0 p-0 bg-transparent inline">
                    {displayValue}
                  </pre>
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
  const [, setLocation] = useLocation();

  return (
    <DevOnly>
      <DevRecipeTable recipe={recipe} />

      <Button
        onClick={() => postNewRecipe(me, recipe.url.toString(), recipe.id)}
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
