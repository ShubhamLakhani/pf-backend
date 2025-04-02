# per-first-backend

Docker cmd for run

1. create docker build

   ```
   docker build --build-arg PORT=4000 \
       --build-arg ENV=DEV \
       --build-arg MONGO_URI=*** \
       --build-arg ALLOWED_ORIGINS=* \
       --build-arg JWT_SECRET=*** \
       --build-arg JWT_EXPIRY=30d \
       --build-arg ADMIN_DATA='{"name":"admin","password":"***"}' \
       --build-arg AWS_ACCESS_KEY_ID=*** \
       --build-arg AWS_SECRET_ACCESS_KEY=*** \
       --build-arg AWS_REGION=*** \
       --build-arg AWS_BUCKET_NAME=*** \
       -t pet-first/backend-api:dev .
   ```

2. Run docker

   ```
   docker run -p 4000:4000 pet-first/backend-api:dev
   ```

3. Run docker on detach mode

   ```
   docker run -d -p 4000:4000 pet-first/backend-api:dev
   ```

4. Stop docker

   ```
   docker stop <container_id>
   ```
