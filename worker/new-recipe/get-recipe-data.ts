import { CallbackHandler } from 'langfuse-langchain';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { models } from '../_lib/models';

const systemPrompt = `
You are a helpful assistant that pulls out the recipe from a block of markdown.

You will remove any information surrounding the recipe but leave the recipe content exactly as it is. Even if you think there is a typo in the ingredients or instructions, you will leave it as is.

If they exist, you will include:
- title (of the recipe)
- ingredients (of the recipe)
- instructions (of the recipe)
- description (of the recipe)
- author (of the recipe)
- source (website/publisher name)

You will return the cleaned recipe as a JSON object in this order:
- title
- ingredients
- instructions
- description
- author
- source`;

// TODO: fold into schema.ts
export const RecipeData = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  description: z.string(),
  author: z.string(),
  source: z.string(),
});

export type RecipeData = z.infer<typeof RecipeData>;

export function createRecipeDataNode({
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

  const llmWithStructuredOutput = llm.withStructuredOutput(RecipeData);

  return async function getRecipeData(state: { htmlContent: string }) {
    const allMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: state.htmlContent },
    ];
    return await llmWithStructuredOutput.invoke(allMessages);
  };
}
