param (
    [Parameter(Mandatory=$true)]
    [string]$Region,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId
)

$EcrBaseUri = "${AccountId}.dkr.ecr.${Region}.amazonaws.com"

Write-Host "Logging into Amazon ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrBaseUri

$Services = @(
    "restaurant",
    "reservation",
    "ordering",
    "search"
)

foreach ($Service in $Services) {
    $RepoName = "aws-restaurant-management-$Service"
    $ImageUri = "${EcrBaseUri}/${RepoName}:latest"
    
    Write-Host "----------------------------------------"
    Write-Host "Building $Service..."
    docker build -t $RepoName ./services/$Service
    
    Write-Host "Tagging $Service..."
    docker tag ${RepoName}:latest $ImageUri
    
    Write-Host "Pushing $Service to ECR..."
    docker push $ImageUri
}

Write-Host "----------------------------------------"
Write-Host "All images pushed successfully!"
Write-Host "You may now need to terminate your existing EC2 instances so the Auto Scaling Groups launch new ones that pull these images."
