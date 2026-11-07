# Quiz Add Script - Auto-generate and add quiz problems
# Usage:
#   pwsh quiz-add.ps1 history easy
#   pwsh quiz-add.ps1 science medium
#   pwsh quiz-add.ps1 geography hard

param(
    [string]$Category = "",
    [string]$Difficulty = "",
    [string]$QuestionsPath = "apps/web/src/data/questions.json"
)

# Color definitions
$SUCCESS = "Green"
$WARNING = "Yellow"
$ERROR = "Red"
$INFO = "Cyan"

# 1. Validate parameters
$validCategories = @("history", "science", "geography", "general")
$validDifficulties = @("easy", "medium", "hard")

# Korean to English category mapping
$koreanToCategoryMap = @{
    "역사" = "history"
    "과학" = "science"
    "지리" = "geography"
    "일반" = "general"
}

# Convert Korean category to English
if ($koreanToCategoryMap.ContainsKey($Category)) {
    $Category = $koreanToCategoryMap[$Category]
}

if (-not $Category -or $Category -notin $validCategories) {
    Write-Host "Category error" -ForegroundColor $ERROR
    Write-Host "   Usage: quiz-add.ps1 <category> <difficulty>" -ForegroundColor $INFO
    Write-Host "   English: $($validCategories -join ', ')" -ForegroundColor $INFO
    Write-Host "   Korean: 역사, 과학, 지리, 일반" -ForegroundColor $INFO
    exit 1
}

# Korean to English difficulty mapping
$koreanToDifficultyMap = @{
    "쉬움" = "easy"
    "중간" = "medium"
    "어려움" = "hard"
}

# Convert Korean difficulty to English
if ($koreanToDifficultyMap.ContainsKey($Difficulty)) {
    $Difficulty = $koreanToDifficultyMap[$Difficulty]
}

if (-not $Difficulty -or $Difficulty -notin $validDifficulties) {
    Write-Host "Difficulty error" -ForegroundColor $ERROR
    Write-Host "   English: $($validDifficulties -join ', ')" -ForegroundColor $INFO
    Write-Host "   Korean: 쉬움, 중간, 어려움" -ForegroundColor $INFO
    exit 1
}

Write-Host "Auto-generating quiz: $Category / $Difficulty" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

# 2. Check file
if (-not (Test-Path $QuestionsPath)) {
    Write-Host "File not found: $QuestionsPath" -ForegroundColor $ERROR
    exit 1
}

# 3. Read JSON
try {
    $content = Get-Content $QuestionsPath -Raw -Encoding UTF8
    $questions = $content | ConvertFrom-Json
} catch {
    Write-Host "JSON parsing failed" -ForegroundColor $ERROR
    exit 1
}

# 4. Generate new ID
$categoryQuestions = $questions | Where-Object { $_.category -eq $Category }
$maxId = 0
foreach ($q in $categoryQuestions) {
    $idParts = $q.id -split '_'
    if ($idParts.Count -eq 2 -and [int]::TryParse($idParts[1], [ref]$num)) {
        if ($num -gt $maxId) { $maxId = $num }
    }
}
$newIdNum = $maxId + 1
$newId = "$Category`_$($newIdNum.ToString('000'))"

# 5. Auto-generate question based on category and difficulty
# NOTE: In real implementation, Claude generates these
# Here we show the pattern - actual generation happens via API call

Write-Host "Claude is generating the question..." -ForegroundColor $INFO
Write-Host ""
Write-Host "NOTE: Question generation requires Claude API integration" -ForegroundColor $WARNING
Write-Host "Current implementation requires user to provide generation method" -ForegroundColor $WARNING
Write-Host ""
Write-Host "To use this feature, configure:" -ForegroundColor $INFO
Write-Host "  - API endpoint for LLM question generation" -ForegroundColor $INFO
Write-Host "  - Validation rules for generated questions" -ForegroundColor $INFO
Write-Host "  - Answer distribution balancing" -ForegroundColor $INFO
Write-Host ""
Write-Host "For now, please use /quiz-add with proper setup." -ForegroundColor $WARNING
Write-Host ""

exit 0
