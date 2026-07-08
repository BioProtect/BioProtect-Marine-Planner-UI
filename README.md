# BioProtect

Web client for BioProtect, a spatial conservation planning tool built on Marxan. Built with React, Vite, MUI, Redux Toolkit and Mapbox GL.

See also the companion server: [marxan-server](https://gitlab.insight-centre.org/caltig/marxan-server).

## Architecture
![BioProtect client architecture](architecture_client.png)

## Requirements
- Node.js (see `package.json` for dependency versions)
- A Mapbox account (for map tiles and geocoding)
- A running instance of the [server](https://gitlab.insight-centre.org/caltig/marxan-server) (or set `VITE_API_BASE_URL` to a remote one)

## Setup
```
git clone <this-repo>
cd frontend
npm install
```

Create a `.env` file in the project root with:
```
VITE_MAPBOX_TOKEN=<mapbox secret token>
VITE_MAPBOX_PUBLIC_TOKEN=<mapbox public token>
VITE_API_BASE_URL=<url of the marxan-server instance, e.g. http://localhost>
```

## Development
```
npm start
```
Runs the Vite dev server at http://localhost:4500 and opens it in the browser.

## Scripts
- `npm start` - run the dev server
- `npm run build` - build for production into `build/`
- `npm run serve` - preview the production build locally
- `npm test` - run the test suite (Vitest)
- `npm run test:coverage` - run tests with coverage
- `npm run deploy` - build and publish `build/` to GitHub Pages

## Project structure
Key path aliases (see `vite.config.ts`): `@slices`, `@planningGrids`, `@projects`, `@features`, `@navbars`, `@images`, `@hooks`, `@config`, `@store`, `@utils`, all resolving under `src/`.

Notable areas under `src/`:
- `LeftInfoPanel/`, `RightInfoPanel/`, `MenuBar/` - main app panels
- `planningGrids/`, `projects/`, `features/` - domain data views
- `HexInfo/` - planning unit inspection popover
- `slices/` - Redux Toolkit state

## Deployment

### Docker
A standalone Docker image is provided, intended to run behind an nginx-fronted deployment alongside a `marxan-server` instance and database.

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

## License
See [LICENSE](LICENSE).
