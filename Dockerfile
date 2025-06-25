FROM node:20.10.0-alpine

WORKDIR /app

# Copy package.json and package-lock.json from photo-gallary directory
COPY photo-gallary/package*.json ./
RUN npm install

# Copy the rest of the application
COPY photo-gallary/ ./

# Generate Prisma client
RUN npx prisma generate

# Install serve package for static file serving
RUN npm install -g serve

# Create a script to run migrations and start the application
RUN echo '#!/bin/sh' > /app/start.sh
RUN echo 'npx prisma migrate deploy' >> /app/start.sh
RUN echo 'npx serve@latest out -p 3001' >> /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 3001
EXPOSE 3001

# Start the application
#CMD ["/app/start.sh"]

CMD ["sh", "./start.sh"]
