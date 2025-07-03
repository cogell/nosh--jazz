import { CallbackHandler } from 'langfuse-langchain';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { models } from '../_lib/models';

const systemPrompt = `
You are a helpful assistant that applies tags to a recipe.

You will be given a list of possible tags and a recipe.

You will return a list of tags that are most relevant to the recipe.

You will return the tags as a JSON object with a tags property that is an array of strings.
`;

type ApplyTagsState = {
  possibleTags: string[];
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
  recipeDescription: string;
};

const userPrompt = ({
  possibleTags,
  recipeTitle,
  recipeIngredients,
  recipeInstructions,
  recipeDescription,
}: ApplyTagsState) => `

Possible tags:
${possibleTags.join('\n')}

Recipe title:
${recipeTitle}

Recipe ingredients:
${recipeIngredients.join('\n')}

Recipe instructions:
${recipeInstructions.join('\n')}

Recipe description:
${recipeDescription}
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
