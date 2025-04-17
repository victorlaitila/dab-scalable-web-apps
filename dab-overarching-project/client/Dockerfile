FROM denoland/deno:2.0.2

WORKDIR /app

# Setup Deno config and dependencies
COPY deno.json* ./
COPY package.json package-lock.json* ./

# Optional: Just cache astro
RUN deno cache npm:astro

# Copy the rest of the files
COPY . .

# Start the client dev server
CMD ["deno", "task", "dev", "--host"]
