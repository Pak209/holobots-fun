
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Create a shell script for the entrypoint
RUN echo '#!/bin/sh \n\
# Start the Vite preview server with proper SPA routing \n\
exec npm run preview -- --host 0.0.0.0 \n\
' > /app/entrypoint.sh \
&& chmod +x /app/entrypoint.sh

EXPOSE 8080

CMD ["/app/entrypoint.sh"]
