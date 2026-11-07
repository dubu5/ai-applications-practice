import { useState, useEffect } from 'react';
import questions from './data/questions.json';
import { Question, GameSession } from './features/quiz/types';
import { extractQuestionsPerCategory, initGameSession } from './features/quiz/quizEngine';
import { saveSession, loadSession, clearSession, saveNickname, loadNickname } from './features/storage/sessionStorage';
import StartScreen from './components/screens/StartScreen';
import NicknameScreen from './components/screens/NicknameScreen';
import GameRulesScreen from './components/screens/GameRulesScreen';
import CategoryIntroScreen from './components/screens/CategoryIntroScreen';
import QuizScreen from './components/screens/QuizScreen';
import FeedbackScreen from './components/screens/FeedbackScreen';
import CategorySummaryScreen from './components/screens/CategorySummaryScreen';
import ResultScreen from './components/screens/ResultScreen';

type ScreenType = 'start' | 'nickname' | 'rules' | 'category-intro' | 'quiz' | 'feedback' | 'category-summary' | 'result';

function App() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [session, setSession] = useState<GameSession | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [savedNickname, setSavedNickname] = useState<string>('');

  useEffect(() => {
    const saved = loadNickname();
    if (saved) setSavedNickname(saved);

    const activeSession = loadSession();
    if (activeSession && activeSession.currentQuestionIndex < 40) {
      setSession(activeSession);
      const extracted = extractQuestionsPerCategory(questions as Question[]);
      setQuizQuestions(extracted);
      setScreen('quiz');
    }
  }, []);

  const handleStartGame = () => {
    setScreen('nickname');
  };

  const handleNicknameSubmit = (nickname: string) => {
    saveNickname(nickname);
    setSavedNickname(nickname);
    setScreen('rules');
  };

  const handleRulesNext = () => {
    try {
      const extracted = extractQuestionsPerCategory(questions as Question[]);
      setQuizQuestions(extracted);
      const newSession = initGameSession(savedNickname, extracted.map(q => q.id));
      setSession(newSession);
      saveSession(newSession);
      setScreen('category-intro');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      alert('게임을 시작할 수 없습니다. 문제 데이터를 확인해주세요.');
    }
  };

  const handleCategoryIntroNext = () => {
    setScreen('quiz');
  };

  const handleAnswerSubmit = (
    selectedIndex: number,
    isCorrect: boolean,
    score: number,
    timeRemainingMs: number
  ) => {
    if (!session) return;
    const questionId = quizQuestions[session.currentQuestionIndex].id;
    const updatedSession = {
      ...session,
      answers: [
        ...session.answers,
        {
          questionId,
          selectedIndex,
          timeRemainingMs,
          score,
          isCorrect,
        },
      ],
      totalScore: session.totalScore + score,
      currentQuestionIndex: session.currentQuestionIndex + 1,
    };
    setSession(updatedSession);
    saveSession(updatedSession);
    setScreen('feedback');
  };

  const handleFeedbackNext = () => {
    if (!session) return;
    const currentIndex = session.currentQuestionIndex;
    const nextCategoryIndex = Math.floor(currentIndex / 10);
    const currentCategoryIndex = Math.floor((currentIndex - 1) / 10);

    if (nextCategoryIndex > currentCategoryIndex && currentIndex < 40) {
      setScreen('category-summary');
    } else if (currentIndex >= 40) {
      setScreen('category-summary');
    } else {
      setScreen('quiz');
    }
  };

  const handleCategorySummaryNext = () => {
    if (!session || session.currentQuestionIndex >= 40) {
      setScreen('result');
    } else {
      setScreen('quiz');
    }
  };

  const handleGameRestart = () => {
    clearSession();
    setSession(null);
    setQuizQuestions([]);
    setScreen('start');
  };

  if (!session || quizQuestions.length === 0) {
    if (screen === 'start') {
      return <StartScreen onStart={handleStartGame} />;
    }
    if (screen === 'nickname') {
      return <NicknameScreen defaultNickname={savedNickname} onSubmit={handleNicknameSubmit} />;
    }
    if (screen === 'rules') {
      return <GameRulesScreen onNext={handleRulesNext} />;
    }
  }

  if (!session || quizQuestions.length === 0) {
    return <div>로딩 중...</div>;
  }

  const currentQuestion = quizQuestions[session.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {screen === 'category-intro' && (
        <CategoryIntroScreen
          categoryIndex={Math.floor(session.currentQuestionIndex / 10)}
          onNext={handleCategoryIntroNext}
        />
      )}
      {screen === 'quiz' && currentQuestion && (
        <QuizScreen
          question={currentQuestion}
          questionNumber={session.currentQuestionIndex + 1}
          totalQuestions={40}
          currentScore={session.totalScore}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}
      {screen === 'feedback' && (
        <FeedbackScreen
          question={quizQuestions[session.currentQuestionIndex - 1]}
          selectedIndex={session.answers[session.answers.length - 1].selectedIndex}
          isCorrect={session.answers[session.answers.length - 1].isCorrect}
          score={session.answers[session.answers.length - 1].score}
          onNext={handleFeedbackNext}
        />
      )}
      {screen === 'category-summary' && (
        <CategorySummaryScreen
          session={session}
          questions={quizQuestions}
          onNext={handleCategorySummaryNext}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          session={session}
          questions={quizQuestions}
          onRestart={handleGameRestart}
        />
      )}
    </div>
  );
}

export default App;
