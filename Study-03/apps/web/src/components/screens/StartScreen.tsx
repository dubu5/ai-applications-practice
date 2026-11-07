import Button from '../common/Button';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">🧠</h1>
        <h2 className="text-4xl font-bold text-white mb-8">상식 퀴즈</h2>
        <p className="text-xl text-blue-100 mb-12 max-w-sm">
          한국사, 과학, 지리, 일반상식 40문제로 당신의 상식을 테스트하세요!
        </p>

        <div className="space-y-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="w-full max-w-xs text-lg font-bold"
          >
            게임 시작
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full max-w-xs text-lg font-bold"
          >
            순위표
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full max-w-xs text-lg font-bold"
          >
            게임 방법
          </Button>
        </div>

        <p className="text-sm text-blue-100 mt-8">
          © 2024 상식 퀴즈 게임
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
