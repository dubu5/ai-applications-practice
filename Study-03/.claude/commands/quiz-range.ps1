# Quiz Range Review Script - 문제 범위 검토
# 사용법:
#   pwsh quiz-range.ps1 1 10      # 1번부터 10번까지 검토
#   pwsh quiz-range.ps1 11 20     # 11번부터 20번까지 검토

param(
    [int]$Start = 1,
    [int]$End = 10,
    [string]$QuestionsPath = "apps/web/src/data/questions.json"
)

# 색상 정의
$SUCCESS = "Green"
$WARNING = "Yellow"
$ERROR = "Red"
$INFO = "Cyan"
$GRAY = "DarkGray"

# 난이도 아이콘
$difficultyIcons = @{
    "easy" = "🟢"
    "medium" = "🟡"
    "hard" = "🔴"
}

# 카테고리 아이콘
$categoryIcons = @{
    "history" = "🏛️"
    "science" = "🧪"
    "geography" = "🗺️"
    "general" = "📚"
}

# 1. 파일 확인
if (-not (Test-Path $QuestionsPath)) {
    Write-Host "❌ 에러: 파일을 찾을 수 없습니다" -ForegroundColor $ERROR
    Write-Host "   경로: $QuestionsPath" -ForegroundColor $ERROR
    exit 1
}

# 2. JSON 읽기
try {
    $content = Get-Content $QuestionsPath -Raw -Encoding UTF8
    $allQuestions = $content | ConvertFrom-Json
} catch {
    Write-Host "❌ JSON 파싱 실패: $_" -ForegroundColor $ERROR
    exit 1
}

# 3. 범위 검증
if ($Start -lt 1 -or $End -gt $allQuestions.Count -or $Start -gt $End) {
    Write-Host "❌ 잘못된 범위입니다" -ForegroundColor $ERROR
    Write-Host "   유효한 범위: 1 ~ $($allQuestions.Count)" -ForegroundColor $ERROR
    exit 1
}

# 4. 범위에 해당하는 문제 추출
$questions = $allQuestions | Select-Object -Index ($Start - 1)..($End - 1)

Write-Host "📊 퀴즈 범위 검토: $Start ~ $End번" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

Write-Host "📋 문제 목록:" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

$index = $Start
foreach ($q in $questions) {
    $icon = $difficultyIcons[$q.difficulty]
    $catIcon = $categoryIcons[$q.category]

    Write-Host "[$index] $($q.id) | $($q.question)" -ForegroundColor White
    Write-Host "    $icon $($q.difficulty) | 정답: $($q.answerIndex)번 ($($q.choices[$q.answerIndex]))" -ForegroundColor $GRAY
    Write-Host ""

    $index++
}

# 5. 통계 계산
Write-Host "📈 통계:" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

Write-Host "🎯 총 문제: $($questions.Count)개" -ForegroundColor $INFO
Write-Host ""

# 난이도 분포
$diffCounts = @{}
foreach ($diff in @("easy", "medium", "hard")) {
    $count = ($questions | Where-Object { $_.difficulty -eq $diff }).Count
    $diffCounts[$diff] = $count
}

Write-Host "난이도 분포:" -ForegroundColor $INFO
foreach ($diff in @("easy", "medium", "hard")) {
    $count = $diffCounts[$diff]
    $percent = [Math]::Round(($count / $questions.Count * 100), 1)
    $icon = $difficultyIcons[$diff]
    Write-Host "  $icon $($diff -replace '^.', { $_.Value.ToUpper() } ) : $count`개 ($percent%)" -ForegroundColor $(if ($percent -gt 50) { $WARNING } else { $SUCCESS })
}
Write-Host ""

# 정답 분포
$answerCounts = @{ 0 = 0; 1 = 0; 2 = 0; 3 = 0 }
foreach ($q in $questions) {
    $answerCounts[$q.answerIndex]++
}

Write-Host "정답 분포:" -ForegroundColor $INFO
$maxAnswer = $answerCounts.Values | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
foreach ($idx in 0..3) {
    $count = $answerCounts[$idx]
    $percent = [Math]::Round(($count / $questions.Count * 100), 1)
    $bar = "█" * [Math]::Round($percent / 5)

    # 편중 검사 (50% 이상)
    $isSkewed = $percent -ge 50
    Write-Host "  선택지 $idx`번 : $count`개 ($percent%) $bar" -ForegroundColor $(if ($isSkewed) { $WARNING } else { $SUCCESS })
}
Write-Host ""

# 카테고리 분포
$catCounts = @{}
foreach ($cat in @("history", "science", "geography", "general")) {
    $count = ($questions | Where-Object { $_.category -eq $cat }).Count
    $catCounts[$cat] = $count
}

Write-Host "카테고리 분포:" -ForegroundColor $INFO
foreach ($cat in @("history", "science", "geography", "general")) {
    $count = $catCounts[$cat]
    $percent = [Math]::Round(($count / $questions.Count * 100), 1)
    $icon = $categoryIcons[$cat]
    $catName = $cat -replace '^.', { $_.Value.ToUpper() }
    Write-Host "  $icon $($catName -replace 'y$', 'y'.ToUpper()) : $count`개 ($percent%)" -ForegroundColor $INFO
}
Write-Host ""

# 6. 검증 및 주의사항
Write-Host "⚠️  주의사항:" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO

# 정답 분포 검증
$skewed = $false
foreach ($idx in 0..3) {
    $percent = [Math]::Round(($answerCounts[$idx] / $questions.Count * 100), 1)
    if ($percent -ge 50) {
        Write-Host "❌ 정답이 편중되어 있습니다 (선택지 $idx`번: $percent%)" -ForegroundColor $WARNING
        $skewed = $true
    }
}

if (-not $skewed) {
    Write-Host "✅ 정답이 고르게 분포되어 있습니다 (50% 미만 편중)" -ForegroundColor $SUCCESS
}

# 난이도 검증
$easyPercent = [Math]::Round(($diffCounts["easy"] / $questions.Count * 100), 1)
if ($easyPercent -ge 70 -or $easyPercent -le 10) {
    Write-Host "❌ 난이도 분포가 불균형합니다" -ForegroundColor $WARNING
} else {
    Write-Host "✅ 난이도가 적절히 섞여 있습니다" -ForegroundColor $SUCCESS
}

# 카테고리 검증
$maxCat = $catCounts.Values | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$catPercent = [Math]::Round(($maxCat / $questions.Count * 100), 1)
if ($catPercent -ge 60) {
    Write-Host "⚠️  같은 카테고리가 많습니다 ($catPercent%)" -ForegroundColor $WARNING
} else {
    Write-Host "✅ 카테고리가 균등하게 분포되어 있습니다" -ForegroundColor $SUCCESS
}

Write-Host ""
