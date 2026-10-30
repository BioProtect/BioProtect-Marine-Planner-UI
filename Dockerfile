# build environment
FROM node:22-alpine as build

WORKDIR /app
RUN npm install -g pnpm@12.16.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# prepare wires git hooks, which needs a .git dir the image doesn't have
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
