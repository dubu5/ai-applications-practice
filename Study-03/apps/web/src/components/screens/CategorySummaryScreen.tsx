import { GameSession, Question } from '../../features/quiz/types';
import { calculateCategoryStats } from '../../features/quiz/scoreCalculator';
import Button from '../common/Button';

interface CategorySummaryScreenProps {
  session: GameSession;
  questions: Question[];
  onNext: () => void;
}

const CATEGORIES = [
  { name: '한국사', icon: '🏛️' },
  { name: '과학', icon: '🔬' },
  { name: '지리', icon: '🌍' },
  { name: '일반상식', icon: '💡' },
];

const CategorySummaryScreen = ({ session, questions, onNext }: CategorySummaryScreenProps) => {
  const categoryIndex = Math.floor(Math.min(session.currentQuestionIndex, 39) / 10);
  const category = CATEGORIES[categoryIndex];

  const startIdx = categoryIndex * 10;
  const endIdx = Math.min(startIdx + 10, session.answers.length);
  const categoryAnswers = session.answers.slice(startIdx, endIdx);

  const stats = calculateCategoryStats(categoryAnswers);

  const isLastCategory = session.currentQuestionIndex >= 40;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {category.icon} {category.name}
        </h2>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {stats.correctAnswers}
              </p>
              <p className="text-gray-600">정답</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score}점
              </p>
              <p className="text-gray-600">총 점수</p>
            </div>
          </div>

          {/* Percentage */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-700">정답률</p>
              <p className="font-semibold text-blue-600">{Math.round(stats.correctPercentage)}%</p>
            </div>
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${stats.correctPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Score */}
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">누적 점수</p>
            <p className="text-3xl font-bold text-gray-800">{session.totalScore}점</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full text-lg font-bold"
        >
          {isLastCategory ? '최종 결과 보기' : '다음 카테고리'}
        </Button>
      </div>
    </div>
  );
};

export default CategorySummaryScreen;
