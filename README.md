## Troubleshooting

- Refreshing the app gives a 404
  - Classic SPA issue. Need to redirect all admin/\* routes to index.html. There are some exceptions. Look at the redirects in [netlify.toml](./netlify.toml).
-

## Resources

- [Invalid ELF Header](https://stackoverflow.com/questions/69319614/invalid-elf-header-argon2-package)
  - `npm install --target_arch=x64 --target_platform=linux --target_libc=glibc`
- [Cannot Find Module '@napi-rs/\*'](https://github.com/directus/directus/discussions/16257)
  - Dev environment is different from prod environment. The packages under `@napi-rs` have many build targets.
