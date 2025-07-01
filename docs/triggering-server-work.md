# Triggering Server Work

Options:

1. Simplest Possible: ✅ start here

- server work triggered by HTTP request when user adds a recipe ✅ (only doing this for noe)
- when user is offline, do nothing
  - when back online
    - we can fire off fetch requests for all the recipes that havent been "run"
    - user can hit retry button

2. More Complex: Cloudflare Durable Objects -> Queue -> Worker
