import { CallbackHandler } from 'langfuse-langchain';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { models } from '../_lib/models';

const systemPrompt = `
You are a helpful assistant that listens to the user's instructions around how to apply tags to a recipe and then returns a list of tags that are most relevant to the recipe.

You will be given a list of possible tags and a recipe. You will also be given instructions on how to apply the tags to the recipe.

You will return a list of tags based on the instructions.
`;

type ApplyTagsState = {
  tagInstructions: string;
  possibleTags: string[];
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
  recipeDescription: string;
};

const userPrompt = ({
  tagInstructions,
  possibleTags,
  recipeTitle,
  recipeIngredients,
  recipeInstructions,
  recipeDescription,
}: ApplyTagsState) => `

<tag-instructions>
${tagInstructions}
</tag-instructions>

<possible-tags>
${possibleTags.join('\n')}
</possible-tags>

<recipe-title>
${recipeTitle}
</recipe-title>

<recipe-ingredients>
${recipeIngredients.join('\n')}
</recipe-ingredients>

<recipe-instructions>
${recipeInstructions.join('\n')}
</recipe-instructions>

<recipe-description>
${recipeDescription}
</recipe-description>
`;

export function createApplyTagsNode({
  env,
  lfHandler,
}: {
  env: Env;
  lfHandler: CallbackHandler;
}) {
  const llm = new ChatOpenAI({
    openAIApiKey: env.OPENAI_API_KEY,
    modelName: models.openai.gpt41Mini.fullName,
    temperature: 0,
    callbacks: [lfHandler],
  });

  return async function getRecipeData(state: ApplyTagsState) {
    const allMessages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userPrompt(state),
      },
    ];

    const Tags = z.object({
      tags: z.array(z.enum(state.possibleTags as [string, ...string[]])),
    });

    const llmWithStructuredOutput = llm.withStructuredOutput(Tags);

    return await llmWithStructuredOutput.invoke(allMessages);
  };
}
