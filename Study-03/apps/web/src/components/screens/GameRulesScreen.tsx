import Button from '../common/Button';

interface GameRulesScreenProps {
  onNext: () => void;
}

const GameRulesScreen = ({ onNext }: GameRulesScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">게임 방법</h2>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 mb-8">
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">📋 게임 규칙</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 총 40문제를 풀어야 합니다 (카테고리별 10문제)</li>
              <li>• 카테고리: 한국사 → 과학 → 지리 → 일반상식 순서</li>
              <li>• 각 문제당 15초 제한시간이 있습니다</li>
              <li>• 한번 선택한 답은 변경할 수 없습니다</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">⭐ 점수 계산</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 정답: 기본 10점</li>
              <li>• 속도 보너스: 남은 시간에 따라 0~5점</li>
              <li>• 오답 또는 시간 초과: 0점</li>
              <li>• 최대 점수: 40문제 × 15점 = 600점</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">🎮 조작 방법</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 마우스로 보기 버튼 클릭</li>
              <li>• 키보드: 1~4 키로 선택 가능</li>
              <li>• 터치: 보기 버튼 터치</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">✨ 팁</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 피드백을 통해 정답 여부를 즉시 확인할 수 있습니다</li>
              <li>• 정답: 초록색 ✓</li>
              <li>• 오답: 빨간색 ✗</li>
              <li>• 각 카테고리마다 소계가 표시됩니다</li>
            </ul>
          </section>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full text-lg font-bold"
        >
          게임 시작
        </Button>
      </div>
    </div>
  );
};

export default GameRulesScreen;
