export const models = {
  openai: {
    // Use dot-notation instead of brackets:
    //   models.openai.gpt41.fullName
    //   models.openai.gpt41Mini.pricing.outputPer1M
    gpt41: {
      fullName: 'gpt-4.1',
      pricing: {
        inputPer1M: 2.0,
        cachedInputPer1M: 0.5,
        outputPer1M: 8.0,
      },
    },
    gpt41Mini: {
      fullName: 'gpt-4.1-mini',
      pricing: {
        inputPer1M: 0.4,
        cachedInputPer1M: 0.1,
        outputPer1M: 1.6,
      },
    },
    gpt41Nano: {
      fullName: 'gpt-4.1-nano',
      pricing: {
        inputPer1M: 0.1,
        cachedInputPer1M: 0.025,
        outputPer1M: 0.4,
      },
    },
    o3: {
      fullName: 'o3',
      pricing: {
        inputPer1M: 2.0,
        cachedInputPer1M: 0.5,
        outputPer1M: 8.0,
      },
    },
    o4Mini: {
      fullName: 'o4-mini',
      pricing: {
        inputPer1M: 1.1,
        cachedInputPer1M: 0.275,
        outputPer1M: 4.4,
      },
    },
  },
};
