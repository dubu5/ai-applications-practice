import Button from '../common/Button';

interface CategoryIntroScreenProps {
  categoryIndex: number;
  onNext: () => void;
}

const CATEGORIES = [
  { name: '한국사', icon: '🏛️', color: 'from-red-400 to-red-600' },
  { name: '과학', icon: '🔬', color: 'from-green-400 to-green-600' },
  { name: '지리', icon: '🌍', color: 'from-blue-400 to-blue-600' },
  { name: '일반상식', icon: '💡', color: 'from-yellow-400 to-yellow-600' },
];

const CategoryIntroScreen = ({ categoryIndex, onNext }: CategoryIntroScreenProps) => {
  const category = CATEGORIES[categoryIndex];

  if (!category) {
    return <div>카테고리를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${category.color} flex items-center justify-center p-4`}>
      <div className="text-center">
        <div className="text-8xl mb-6">{category.icon}</div>
        <h2 className="text-4xl font-bold text-white mb-4">{category.name}</h2>
        <p className="text-2xl font-semibold text-white mb-2">
          {categoryIndex + 1} / 4 카테고리
        </p>
        <p className="text-xl text-white opacity-90 mb-12">
          10개 문제를 풀어보세요!
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="text-lg font-bold min-w-64"
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default CategoryIntroScreen;
