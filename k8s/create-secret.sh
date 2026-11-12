#!/bin/bash
# Replace <password> with your real Atlas password (URL-encode special characters).
kubectl create secret generic app-secret \
  --from-literal=DB_URL='mongodb+srv://db_user:<password>@cluster0.1s6tq4a.mongodb.net/studentdb?retryWrites=true&w=majority'
