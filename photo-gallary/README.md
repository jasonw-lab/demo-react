# Photo Gallery Application

A modern photo gallery application built with Next.js that allows users to upload, view, edit, and delete photos. The application uses:

- **Frontend & Backend**: Next.js
- **Database**: MySQL with Prisma ORM
- **Storage**: Minio for photo storage
- **UI**: Tailwind CSS with shadcn/ui components

## Features

- View all photos in a responsive grid layout
- Upload new photos with title and description
- Edit existing photos (title, description, and image)
- Delete photos
- Responsive design that works on mobile and desktop

## Prerequisites

Before running this application, you need to have the following installed:

1. Node.js (v18 or later)
2. MySQL server
3. Minio server (or any S3-compatible storage)

## Setup

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set up MySQL

Create a new MySQL database:

```sql
CREATE DATABASE photo_gallery;
```

### 3. Set up Minio

Install and run Minio following the [official documentation](https://min.io/docs/minio/container/index.html).

The default credentials are:
- Access Key: minioadmin
- Secret Key: minioadmin

### 4. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL="mysql://username:password@localhost:3306/photo_gallery"

# Minio
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="photos"
MINIO_PUBLIC_URL="http://localhost:9000"
```

Replace `username` and `password` with your MySQL credentials.

### 5. Initialize the database

Run the Prisma migration to create the database schema:

```bash
npx prisma migrate dev --name init
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Docker Setup (Alternative)

You can also run the entire application stack (Next.js, MySQL, and Minio) using Docker Compose:

1. Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@mysql:3306/photo_gallery
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_USE_SSL=false
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=photos
      - MINIO_PUBLIC_URL=http://localhost:9000
    depends_on:
      - mysql
      - minio

  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=photo_gallery
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  mysql-data:
  minio-data:
```

2. Create a `Dockerfile` in the root directory:

```Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["npm", "start"]
```

3. Run the application stack:

```bash
docker-compose up -d
```

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions and services
  - `prisma.ts` - Prisma client setup
  - `minio.ts` - Minio client setup
  - `photoService.ts` - Frontend service for interacting with the API
- `/prisma` - Prisma schema and migrations

## API Routes

- `GET /api/photos` - Get all photos
- `POST /api/photos` - Create a new photo
- `GET /api/photos/[id]` - Get a specific photo
- `PUT /api/photos/[id]` - Update a photo
- `DELETE /api/photos/[id]` - Delete a photo

## Production Configuration

### Current Settings

The application is configured for deployment to the production environment at:
```
http://160.251.178.119/photo-gallary/
```

The `next.config.ts` file includes the following settings:
```javascript
output: "export",
basePath: '/photo-gallary',
```

These settings have the following effects:
- `output: "export"` generates a completely static site without server-side functionality
- `basePath: '/photo-gallary'` sets the base path for all routes to '/photo-gallary'

### Important Note About API Routes

**The current configuration disables all API routes.**

When using `output: "export"`, Next.js generates a completely static site without any server-side functionality. This means that all API routes (including those listed above) will not work in the production environment.

For detailed information about this limitation and recommended solutions, please refer to the [API Solution](./API_SOLUTION.md) document.

### Testing Production Configuration

To test the application with the production configuration:

1. Build the application:
   ```
   npm run build
   ```

2. Start the server:
   ```
   npm run start
   ```

3. Access the application at:
   ```
   http://localhost:3001/photo-gallary/
   ```

4. To demonstrate the API limitation, run:
   ```
   node test-static-api.js
   ```
   This script will attempt to access the API endpoint and is expected to fail, demonstrating the limitation of static export.

### Deployment

To deploy this application to the production environment:

1. Build the application:
   ```
   npm run build
   ```

2. The output will be in the `out` directory, which can be deployed to your web server.

3. Configure your web server to serve the static files from the `out` directory at the path `/photo-gallary/`.

4. For API functionality, implement one of the solutions described in the [API Solution](./API_SOLUTION.md) document.
