# PowerShell Script to build, tag and push DriveHub Docker images to Docker Hub

$DockerHubUsername = "dankata123"
$BackendImageName = "$DockerHubUsername/drivehub-backend"
$FrontendImageName = "$DockerHubUsername/drivehub-frontend"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " DriveHub - Docker Hub Publish Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[!] ВАЖНО: Моля, уверете се, че първо сте влезли в Docker Hub." -ForegroundColor Yellow
Write-Host "Ако не сте, изпълнете: docker login -u $DockerHubUsername" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Искате ли да продължите с изграждането и качването? (y/n)"
if ($response -ne "y" -and $response -ne "yes") {
    Write-Host "Операцията е отказана." -ForegroundColor Red
    Exit
}

# 1. Build & Tag Backend
Write-Host ""
Write-Host "[1/4] Изграждане на Backend образ..." -ForegroundColor Blue
docker build -t "$BackendImageName:latest" ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Грешка при изграждане на Backend образ." -ForegroundColor Red
    Exit $LASTEXITCODE
}

# 2. Build & Tag Frontend
Write-Host ""
Write-Host "[2/4] Изграждане на Frontend образ..." -ForegroundColor Blue
docker build -t "$FrontendImageName:latest" ./frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Грешка при изграждане на Frontend образ." -ForegroundColor Red
    Exit $LASTEXITCODE
}

# 3. Push Backend
Write-Host ""
Write-Host "[3/4] Качване на Backend в Docker Hub..." -ForegroundColor Blue
docker push "$BackendImageName:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Грешка при качване на Backend в Docker Hub." -ForegroundColor Red
    Exit $LASTEXITCODE
}

# 4. Push Frontend
Write-Host ""
Write-Host "[4/4] Качване на Frontend в Docker Hub..." -ForegroundColor Blue
docker push "$FrontendImageName:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Грешка при качване на Frontend в Docker Hub." -ForegroundColor Red
    Exit $LASTEXITCODE
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Всички образи са качени успешно!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
