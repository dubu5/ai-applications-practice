import { GameSession, Question } from '../../features/quiz/types';
import { calculateCategoryStats } from '../../features/quiz/scoreCalculator';
import Button from '../common/Button';

interface ResultScreenProps {
  session: GameSession;
  questions: Question[];
  onRestart: () => void;
}

const CATEGORIES = [
  { name: '한국사', icon: '🏛️' },
  { name: '과학', icon: '🔬' },
  { name: '지리', icon: '🌍' },
  { name: '일반상식', icon: '💡' },
];

const ResultScreen = ({ session, questions, onRestart }: ResultScreenProps) => {
  const totalTimeSeconds = Math.round(session.answers.reduce((sum, a) => sum + (15000 - a.timeRemainingMs), 0) / 1000);
  const categoryResults = CATEGORIES.map((category, index) => {
    const startIdx = index * 10;
    const endIdx = startIdx + 10;
    const categoryAnswers = session.answers.slice(startIdx, endIdx);
    const stats = calculateCategoryStats(categoryAnswers);
    return { ...category, ...stats };
  });

  const scorePercentage = (session.totalScore / 600) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 게임 완료!</h2>
          <p className="text-xl text-gray-600 mb-6">{session.nickname}님</p>
        </div>

        {/* Main Score */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2 text-lg">총 점수</p>
            <p className="text-6xl font-bold text-blue-600">{session.totalScore}</p>
            <p className="text-gray-600 mt-2">/ 600점</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <p className="text-center text-gray-600">{Math.round(scorePercentage)}%</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">총 정답</p>
              <p className="text-2xl font-bold">{session.answers.filter(a => a.isCorrect).length}</p>
              <p className="text-xs text-gray-500">/ 40</p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">소요 시간</p>
              <p className="text-2xl font-bold">{totalTimeSeconds}초</p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">정답률</p>
              <p className="text-2xl font-bold">
                {Math.round((session.answers.filter(a => a.isCorrect).length / 40) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Category Results */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">카테고리별 결과</h3>
          <div className="space-y-4">
            {categoryResults.map((result, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-800">
                    {result.icon} {result.name}
                  </p>
                  <p className="font-bold text-blue-600">
                    {result.correctAnswers} / {result.totalQuestions}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <p>{result.score}점</p>
                  <p>{Math.round(result.correctPercentage)}% 정답</p>
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${result.correctPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onRestart}
            className="w-full text-lg font-bold"
          >
            다시 하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
