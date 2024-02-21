## Troubleshooting

- Refreshing the app gives a 404
  - This issue exists with all Single Page Applications. Need to redirect all admin/\* routes to index.html.
  - There are some exceptions. Look at the redirects in [netlify.toml](./netlify.toml).
- `Function api has returned an error: require() of ES Module @directus/api from api.js not supported.`
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

Pursuing the netlify route is a dead end, as the directus api is too large to be hosted on AWS.

Google Cloud Functions has a limit twice as big, about 500MB, so it should be possible to host directus there

Or I can avoid all these shenanigans by just hosting on Render

```js
const serverless = require('serverless-http');

let instance = null;

// https://github.com/directus/directus/discussions/15572#discussioncomment-3707336
const setup = async (event, context) => {
  const { createApp } = await import('@directus/api');
  const app = await createApp();
  instance = serverless(app);
  return instance(event, context);
};

const handler = async (event, context) => {
  if (instance) return instance(event, context);
  return setup(event, context);
};

module.exports.handler = handler;
```

```toml
# netlify.toml
# https://docs.netlify.com/configure-builds/file-based-configuration

[build]
publish = "node_modules/@directus/app/dist"
functions = "functions"

[[redirects]]
from = "/"
to = "/"
status = 200
force = true

[[redirects]]
from = "/favicon.ico"
to = "/favicon.ico"
status = 200
force = true

[[redirects]]
from = "/*/assets/:asset"
to = "/assets/:asset"
status = 200
force = true

[[redirects]]
from = "/admin/*"
to = "index.html"
# to = "/admin/:splat"
status = 200
force = true

[[redirects]]
from = "/*"
# to = "http://0.0.0.0:8055/:splat"
to = "/.netlify/functions/api/:splat"
status = 200
force = true

# https://docs.netlify.com/configure-builds/file-based-configuration/#functions
[functions]
directory = "functions"
node_bundler = "esbuild"
# @directus/api is imported dynamically https://www.netlify.com/blog/2021/08/12/how-to-include-files-in-netlify-serverless-functions/
external_node_modules = ["@directus/api"]

[dev]
framework = "#static"
publish = "node_modules/@directus/app/dist"
```
