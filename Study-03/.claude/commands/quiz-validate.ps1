# Quiz Validation Script - 최상급 표현 검증
# 사용법:
#   pwsh quiz-validate.ps1                    # 전체 검증
#   pwsh quiz-validate.ps1 history            # history 카테고리만 검증

param(
    [string]$QuestionsPath = "apps/web/src/data/questions.json",
    [string]$Category = ""  # 선택적 카테고리 필터
)

# 색상 정의
$SUCCESS = "Green"
$WARNING = "Yellow"
$ERROR = "Red"
$INFO = "Cyan"

Write-Host "📋 퀴즈 문제 검증: 최상급 표현 분석" -ForegroundColor $INFO
if ($Category) {
    Write-Host "   카테고리: $Category" -ForegroundColor $WARNING
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

# 1. 파일 확인
if (-not (Test-Path $QuestionsPath)) {
    Write-Host "❌ 에러: 파일을 찾을 수 없습니다" -ForegroundColor $ERROR
    Write-Host "   경로: $QuestionsPath" -ForegroundColor $ERROR
    Write-Host ""
    Write-Host "💡 팁: 프로젝트 루트에서 실행하세요" -ForegroundColor $WARNING
    exit 1
}

Write-Host "✅ 파일 찾음: $QuestionsPath" -ForegroundColor $SUCCESS
Write-Host ""

# 2. JSON 읽기
try {
    $content = Get-Content $QuestionsPath -Raw
    $questions = $content | ConvertFrom-Json
    Write-Host "✅ JSON 파싱 완료: $($questions.Count)개 문제" -ForegroundColor $SUCCESS
} catch {
    Write-Host "❌ JSON 파싱 실패: $_" -ForegroundColor $ERROR
    exit 1
}

# 2-1. 카테고리 필터링
if ($Category) {
    $validCategories = @("history", "science", "geography", "general")
    if ($Category -notin $validCategories) {
        Write-Host "❌ 잘못된 카테고리: $Category" -ForegroundColor $ERROR
        Write-Host "   가능한 값: $($validCategories -join ', ')" -ForegroundColor $ERROR
        exit 1
    }
    $questions = $questions | Where-Object { $_.category -eq $Category }
    Write-Host "✅ 필터링 완료: $($questions.Count)개 문제 ($Category)" -ForegroundColor $SUCCESS
    Write-Host ""
}

# 3. 최상급 표현 패턴 정의 및 개선 제안
$patterns = @{
    "가장" = @{ type = "최상급"; suggestion = "측정 기준 명시 (크기, 길이, 높이 등)" }
    "최초" = @{ type = "최상급"; suggestion = "시점, 연도, 지역 범위 명시" }
    "최대" = @{ type = "최상급"; suggestion = "최대값 기준 명시 (면적, 인구, 유량 등)" }
    "최고" = @{ type = "최상급"; suggestion = "높이/순위 기준 명시 및 기준 연도" }
    "최소" = @{ type = "최상급"; suggestion = "최소값 기준 명시" }
    "최장" = @{ type = "최상급"; suggestion = "길이/기간 기준 명시" }
    "최단" = @{ type = "최상급"; suggestion = "길이/기간 기준 명시" }
    "제일" = @{ type = "최상급"; suggestion = "측정 기준 명시" }
}

# 기준을 포함하는 표현들 (이미 명시된 것)
$contextMarkers = @(
    "\(.*\)",           # 괄호 안의 설명
    "년",               # 연도
    "월",               # 월
    "기준",             # "~기준"
    "기준으로",         # "~기준으로"
    "약",               # "약 ~"
    "대략",             # "대략"
    "~도",              # "도" (온도 등)
    "km",               # 단위
    "m",                # 단위
    "%",                # 백분율
)

# 4. 검증 실행
$issues = @()

foreach ($q in $questions) {
    $text = "$($q.question) $($q.explanation)"
    $problematic = $false
    $foundPatterns = @()
    $suggestions = @()

    # 최상급 표현 검색
    foreach ($pattern in $patterns.Keys) {
        if ($text -match $pattern) {
            $foundPatterns += $pattern

            # 기준이 명시되어 있는지 확인
            $hasContext = $false
            foreach ($marker in $contextMarkers) {
                if ($text -match "$pattern.*$marker") {
                    $hasContext = $true
                    break
                }
            }

            if (-not $hasContext) {
                $problematic = $true
                $suggestions += $patterns[$pattern].suggestion
            }
        }
    }

    # 문제가 있으면 목록에 추가
    if ($problematic) {
        $issues += @{
            id = $q.id
            category = $q.category
            question = $q.question
            patterns = $foundPatterns -join ", "
            suggestions = $suggestions | Select-Object -Unique
        }
    }
}

# 5. 결과 출력
Write-Host "🔍 검증 결과:" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "✅ 모든 최상급 표현이 기준을 명시하고 있습니다!" -ForegroundColor $SUCCESS
    Write-Host ""
} else {
    Write-Host "⚠️  개선 필요한 항목: $($issues.Count)개" -ForegroundColor $WARNING
    Write-Host ""

    foreach ($item in $issues) {
        Write-Host "❌ [$($item.id)] $($item.question)" -ForegroundColor $WARNING
        Write-Host "   카테고리: $($item.category)" -ForegroundColor $INFO
        Write-Host "   모호한 표현: $($item.patterns)" -ForegroundColor $ERROR
        Write-Host "   💡 개선 제안:" -ForegroundColor $INFO

        foreach ($suggestion in $item.suggestions) {
            Write-Host "      • $suggestion" -ForegroundColor $INFO
        }
        Write-Host ""
    }
}

# 6. 통계
$total = $questions.Count
$withIssues = $issues.Count
$percentage = [Math]::Round((($total - $withIssues) / $total * 100), 1)

Write-Host "📈 통계:" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "검증한 문제: $total개" -ForegroundColor $INFO
Write-Host "기준 명시됨: $($total - $withIssues)개 ($percentage%)" -ForegroundColor $(if ($percentage -eq 100) { $SUCCESS } else { $WARNING })
Write-Host "개선 필요: $withIssues개" -ForegroundColor $(if ($withIssues -eq 0) { $SUCCESS } else { $WARNING })
Write-Host ""

if ($percentage -eq 100) {
    Write-Host "✅ 완벽합니다! 모든 최상급 표현이 검증되었습니다!" -ForegroundColor $SUCCESS
} else {
    Write-Host "📝 개선 제안을 참고하여 문제 설명을 수정해주세요" -ForegroundColor $WARNING
}

Write-Host ""
