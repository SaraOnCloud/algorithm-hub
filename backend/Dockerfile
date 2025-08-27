# Backend (NestJS) multi-stage
FROM node:20-alpine AS deps
WORKDIR /app
# Build dependencies required for argon2 and other native modules
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package*.json ./
# Use npm ci if lock file exists for reproducible builds
RUN if [ -f package-lock.json ]; then npm ci --omit=optional; else npm install --omit=optional; fi

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Install only production dependencies for the final image
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --omit=optional; else npm install --omit=dev --omit=optional; fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only production dependencies and compiled code
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist
# Remove build dependencies (not installed in this layer) for defensive cleanup
RUN rm -rf /var/cache/apk/*
EXPOSE 3000
CMD ["node", "dist/main.js"]
