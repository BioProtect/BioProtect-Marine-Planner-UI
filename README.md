# BioProtect

Web client for BioProtect, a spatial conservation planning tool built on Prioritizr. Built with React, Vite, MUI, Redux Toolkit and Mapbox GL.

## Requirements

- Node.js (see `package.json` for dependency versions)
- pnpm
- A Mapbox public token (for the basemap and geocoding)
- A running [BioProtect server](https://github.com/BioProtect/BioProtect-Marine-Planner-Server) and its Martin tile server (see that repo's README)

## Setup

```
git clone <this-repo>
cd frontend
pnpm install
cp .env.example .env
```

Set `VITE_MAPBOX_PUBLIC_TOKEN` in `.env` to your Mapbox public token.

There's no API URL to configure: the client works it out from the host it's served from
(`src/config/api.jsx`). On `localhost` it calls the server on `http://localhost:8080/server/` and Martin on
`http://localhost:3000/`. On any other host it uses the same origin's `/server/` and `/tiles/`, which nginx
proxies (see the server repo's `deploy/nginx.conf`).

The server's `permitted_domains` must include the address the client runs on (`http://localhost:4500` in development).

## Development

```
pnpm start
```

Runs the Vite dev server at http://localhost:4500 and opens it in the browser.

## Scripts

- `pnpm start` - run the dev server
- `pnpm run build` - build for production into `build/`
- `pnpm run serve` - preview the production build locally
- `pnpm test` - run the test suite (Vitest)
- `pnpm run test:coverage` - run tests with coverage
- `pnpm run lint` - ESLint; add `--fix` to autofix
- `pnpm run ci` - lint + knip + tests (runs as the pre-commit hook)

## Project structure

Key path aliases (see `vite.config.ts`): `@slices`, `@planningGrids`, `@projects`, `@features`, `@navbars`, `@images`, `@hooks`, `@config`, `@store`, `@utils`, all resolving under `src/`.

Notable areas under `src/`:

- `LeftInfoPanel/`, `RightInfoPanel/`, `MenuBar/` - main app panels
- `planningGrids/`, `projects/`, `features/` - domain data views
- `HexInfo/` - planning unit inspection popover
- `slices/` - Redux Toolkit state

## Deployment

### Production

```
pnpm install --frozen-lockfile
pnpm run build
sudo cp -r build/* /opt/bioprotect-client/
```

Serve `/opt/bioprotect-client` from the same nginx site that proxies `/server/` and `/tiles/`; the server repo's
README and `deploy/nginx.conf` cover that side.

### Docker

A standalone Docker image is provided, intended to run behind an nginx-fronted deployment alongside the BioProtect server and database.

Build:

```
docker build -t bioprotect-client:latest .
```

Run:

```
docker run -dp 5000:80 --name bioprotect-client bioprotect-client:latest
```

- `-d` - detached mode
- `-p 5000:80` - maps local port 5000 to the container's exposed port 80
- `--name` - names the container

The image builds the app with Node, then serves the static `build/` output via nginx (see `nginx.conf`).
Vite bakes the `VITE_*` values in at build time, from the `.env` copied into the image, so create `.env` before `docker build`.

## License

See [LICENSE](LICENSE).
