#!/usr/bin/env node

import fs from 'fs';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

// Get category from command line args
const category = process.argv[2] || '';
const questionsPath = 'apps/web/src/data/questions.json';

log('📋 퀴즈 문제 검증: 최상급 표현 분석', 'cyan');
if (category) {
  log(`   카테고리: ${category}`, 'yellow');
}
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('');

// 1. Load questions
if (!fs.existsSync(questionsPath)) {
  log(`❌ 에러: 파일을 찾을 수 없습니다`, 'red');
  log(`   경로: ${questionsPath}`, 'red');
  process.exit(1);
}

log(`✅ 파일 찾음: ${questionsPath}`, 'green');

let questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
log(`✅ JSON 파싱 완료: ${questions.length}개 문제`, 'green');

// 2. Filter by category if specified
if (category) {
  const validCategories = ['history', 'science', 'geography', 'general'];
  const lowerCategory = category.toLowerCase();

  if (!validCategories.includes(lowerCategory)) {
    log(`❌ 잘못된 카테고리: ${category}`, 'red');
    log(`   가능한 값: ${validCategories.join(', ')}`, 'red');
    process.exit(1);
  }

  questions = questions.filter(q => q.category === lowerCategory);
  log(`✅ 필터링 완료: ${questions.length}개 문제 (${lowerCategory})`, 'green');
  log('');
}

// 3. Define patterns and context markers
const patterns = {
  '가장': '측정 기준 명시 (크기, 길이, 높이 등)',
  '최초': '시점, 연도, 지역 범위 명시',
  '최대': '최대값 기준 명시 (면적, 인구, 유량 등)',
  '최고': '높이/순위 기준 명시 및 기준 연도',
  '최소': '최소값 기준 명시',
  '최장': '길이/기간 기준 명시',
  '최단': '길이/기간 기준 명시',
  '제일': '측정 기준 명시',
};

const contextMarkers = [
  /\(.*\)/,           // 괄호 안의 설명
  /\d{3,4}년/,         // 연도
  /\d{1,2}월/,         // 월
  /기준/,             // "~기준"
  /기준으로/,         // "~기준으로"
  /약\s/,             // "약 ~"
  /대략/,             // "대략"
  /\d+도/,            // "도" (온도 등)
  /km/,               // 단위
  /\dm/,              // 단위
  /%/,                // 백분율
];

// 4. Validate
const issues = [];

for (const q of questions) {
  const text = `${q.question} ${q.explanation}`;
  const foundPatterns = [];
  const suggestions = [];
  let problematic = false;

  for (const [pattern, suggestion] of Object.entries(patterns)) {
    if (text.includes(pattern)) {
      foundPatterns.push(pattern);

      // Check if context is provided
      let hasContext = false;
      for (const marker of contextMarkers) {
        const patternIndex = text.indexOf(pattern);
        const contextText = text.substring(patternIndex, patternIndex + 100);
        if (marker.test(contextText)) {
          hasContext = true;
          break;
        }
      }

      if (!hasContext) {
        problematic = true;
        suggestions.push(suggestion);
      }
    }
  }

  if (problematic) {
    issues.push({
      id: q.id,
      category: q.category,
      question: q.question,
      patterns: foundPatterns.join(', '),
      suggestions: [...new Set(suggestions)],
    });
  }
}

// 5. Output results
log('🔍 검증 결과:', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('');

if (issues.length === 0) {
  log('✅ 모든 최상급 표현이 기준을 명시하고 있습니다!', 'green');
} else {
  log(`⚠️  개선 필요한 항목: ${issues.length}개`, 'yellow');
  log('');

  for (const item of issues) {
    log(`❌ [${item.id}] ${item.question}`, 'yellow');
    log(`   카테고리: ${item.category}`, 'cyan');
    log(`   모호한 표현: ${item.patterns}`, 'red');
    log('   💡 개선 제안:', 'cyan');

    for (const suggestion of item.suggestions) {
      log(`      • ${suggestion}`, 'cyan');
    }
    log('');
  }
}

// 6. Statistics
const total = questions.length;
const withIssues = issues.length;
const percentage = total > 0 ? Math.round((total - withIssues) / total * 100 * 10) / 10 : 0;

log('📈 통계:', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log(`검증한 문제: ${total}개`, 'cyan');
log(`기준 명시됨: ${total - withIssues}개 (${percentage}%)`, percentage === 100 ? 'green' : 'yellow');
log(`개선 필요: ${withIssues}개`, withIssues === 0 ? 'green' : 'yellow');
log('');

if (percentage === 100) {
  log('✅ 완벽합니다! 모든 최상급 표현이 검증되었습니다!', 'green');
} else {
  log('📝 개선 제안을 참고하여 문제 설명을 수정해주세요', 'yellow');
}

log('');
process.exit(issues.length > 0 ? 1 : 0);
