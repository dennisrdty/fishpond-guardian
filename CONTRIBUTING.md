# Contributing to Fishpond Guardian

Contributions are welcome, including bug fixes, tests, documentation, and sensor
integration examples.

1. Open an issue describing the bug or proposed improvement. Include reproduction
   steps and expected behavior for bugs; discuss substantial changes before coding.
2. Fork the repository, create a focused branch, and follow the local setup in
   [README.md](README.md).
3. Keep changes small, preserve existing dashboard and Supabase behavior, and add
   or update tests when changing behavior.
4. Run `npm test`, `npm run lint`, and `npm run build`. Include the results and
   disclose any existing failures in your pull request.
5. Open a pull request explaining the problem, your solution, and how you verified
   it. Include screenshots for UI changes and migration instructions for schema changes.

Never commit `.env` files, credentials, or private sensor data. Use the empty
placeholders in `.env.example` when documenting configuration.

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
