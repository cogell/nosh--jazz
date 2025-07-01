# Progress of Recipe Scraping/Parsing

Brainstorming:

Data Schema:

- recipeServerTaskStatus: 'ready', 'running', 'success', 'error'
- recipeServerTaskError: string | null
- recipeServerTaskProgress: number | null // 0-100

- only show the progress bar if the status is 'running'
