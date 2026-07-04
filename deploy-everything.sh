#!/bin/bash
set -e

# Usage check
if [ "$#" -ne 2 ]; then
    echo "Usage: ./deploy-everything.sh <REGION> <ACCOUNT_ID>"
    echo "Example: ./deploy-everything.sh us-east-1 123456789012"
    exit 1
fi

REGION=$1
ACCOUNT_ID=$2

echo "=============================================="
echo "1. DEPLOYING CLOUDFORMATION INFRASTRUCTURE"
echo "=============================================="
aws cloudformation deploy \
    --template-file cloudformation/infrastructure.yml \
    --stack-name restaurant-10-10-architecture \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

echo "=============================================="
echo "2. BUILDING AND PUSHING BACKEND IMAGES"
echo "=============================================="
chmod +x ./deploy-images.sh
./deploy-images.sh $REGION $ACCOUNT_ID

echo "=============================================="
echo "3. BUILDING FRONTEND"
echo "=============================================="
# Install Node.js if not available (Common in CloudShell)
if ! command -v npm &> /dev/null; then
    echo "Node.js not found. Installing via NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

cd frontend
echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build
cd ..

echo "=============================================="
echo "4. DEPLOYING FRONTEND TO S3"
echo "=============================================="
# Get the bucket name from CloudFormation
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name restaurant-10-10-architecture \
    --query "Stacks[0].Outputs[?OutputKey=='S3BucketUrl'].OutputValue" \
    --output text | sed -E 's|https://(.*)\.s3\.amazonaws\.com|\1|')

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" == "None" ]; then
    echo "Error: Could not retrieve S3 bucket name from CloudFormation outputs."
    exit 1
fi

echo "Syncing frontend to S3 bucket: $BUCKET_NAME"
aws s3 sync frontend/dist s3://$BUCKET_NAME/ --delete

# Set public read ACLs on objects since we don't have CloudFront
# Learner Labs sometimes block BucketPolicies, but Object ACLs often work
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --acl public-read || true

echo "=============================================="
echo "DEPLOYMENT COMPLETE!"
echo "=============================================="
echo "Your Application Load Balancer URL:"
aws cloudformation describe-stacks \
    --stack-name restaurant-10-10-architecture \
    --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerUrl'].OutputValue" \
    --output text
