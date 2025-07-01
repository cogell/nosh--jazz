# Managing Form State

Currently exploring the use of XState for managing form state.

Behavior implemented in XState:

- start fetching worker account
  - if successful, save to context
  - if error, move to error state, show error
  - if user tries to submit form before loaded we tell them to wait, then unblock them when loaded
- dont validate url until submit it clicked, then validate on every keystroke

Takeaways:

- there are different ways to implement the same behavior
- the drawn out view of my machine isnt super useful
- we got some nice UX out of this (lets see how maintanable it is)
- while it can feel like overkill, this will be a CORE part of the app

## Reading

### [How I Use Statecharts in Production](https://www.sandromaglione.com/newsletter/how-i-use-statecharts-in-production)

> No matter how simple the state, I use xstate. It's always the case that the state gets more complex, and I am already covered by the benefits of statecharts.
