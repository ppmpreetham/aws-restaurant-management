#!/bin/bash
set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: ./deploy-images.sh <REGION> <ACCOUNT_ID>"
    echo "Example: ./deploy-images.sh us-east-1 123456789012"
    exit 1
fi

REGION=$1
ACCOUNT_ID=$2
ECR_BASE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "Logging into Amazon ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_BASE_URI

SERVICES=("restaurant" "reservation" "ordering" "search")

for SERVICE in "${SERVICES[@]}"; do
    REPO_NAME="aws-restaurant-management-$SERVICE"
    IMAGE_URI="${ECR_BASE_URI}/${REPO_NAME}:latest"
    
    echo "----------------------------------------"
    echo "Building $SERVICE..."
    docker build -t $REPO_NAME ./services/$SERVICE
    
    echo "Tagging $SERVICE..."
    docker tag ${REPO_NAME}:latest $IMAGE_URI
    
    echo "Pushing $SERVICE to ECR..."
    docker push $IMAGE_URI
done

echo "----------------------------------------"
echo "All images pushed successfully!"
echo "If your EC2 instances are already running, you must terminate them so the Auto Scaling Group provisions new ones that pull the latest images."
