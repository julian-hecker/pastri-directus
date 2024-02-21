## Troubleshooting

- Refreshing the app gives a 404
  - This issue exists with all Single Page Applications. Need to redirect all admin/\* routes to index.html.
  - There are some exceptions. Look at the redirects in [netlify.toml](./netlify.toml).
- `Top-level await is currently not supported with the "cjs" output format`
  - Some of the dependencies use `await` outside an async function. Can't directly import these into a cjs file.
  - Need to do something like `await import('@directus/api')`. Also necessitates including `@directus/api` in netlify.toml external_node_modules
- [Invalid ELF Header](https://stackoverflow.com/questions/69319614/invalid-elf-header-argon2-package)
  - Tried to use CLI to deploy code compiled on Windows to a Linux machine.
  - can do `npm install --target_arch=x64 --target_platform=linux --target_libc=glibc`, but won't run on windows
- [Cannot Find Module '@napi-rs/\*'](https://github.com/directus/directus/discussions/16257)
  - Dev environment is different from prod environment. The packages under `@napi-rs` have many build targets.
  - Fix by deploying through console instead of cli, which installs packages on the build server.
- `Error - Cannot find package '@directus/api' imported from /var/task/functions/api.cjs`
  - Since directus is being imported dynamically, it's not being included in the bundle.
  - Force it to be included by adding it to netlify.toml external_node_modules
- `Failed to create function on AWS Lambda: invalid parameter for lambda creation: Unzipped size must be smaller than 262144000 bytes`
  - Since we've included `@directus/api` in our external_node_modules, it's taking it and its whole dependency tree. Must be too big.
  - Maybe try using .mjs? Inlining @directus/api import so it can be tree-shaken?
