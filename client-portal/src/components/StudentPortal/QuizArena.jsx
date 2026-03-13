import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Brain, Play, Clock, Award, TrendingUp, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export const QuizArena = () => {
  const [userId, setUserId] = useState(null);
  const [phase, setPhase] = useState('setup'); // setup | playing | results
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSubjects();
      fetchHistory();
    }
  }, [userId]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/student-subjects/student/${userId}`);
      const subs = [...new Set((res.data || []).map(s => s.subject || s.subjectName || 'Unknown'))];
      setSubjects(subs);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/quiz/history/${userId}`);
      setHistory(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const subParam = subject ? `&subject=${encodeURIComponent(subject)}` : '';
      const res = await api.get(`/quiz/generate/${userId}?count=10${subParam}`);
      const qs = res.data.data || [];
      if (qs.length === 0) {
        toast.error('Not enough approved notes to generate a quiz. Create and get more notes approved!');
        setLoading(false);
        return;
      }
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers({});
      setSelectedOption(null);
      setRevealed(false);
      setTimer(0);
      setPhase('playing');

      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    if (revealed) return;
    setSelectedOption(option);
    setRevealed(true);
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setRevealed(false);
    }
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    // Include last answer
    if (selectedOption === questions[currentQ]?.correctAnswer) correct++;
    // Recalculate properly
    const allAnswers = { ...answers, [currentQ]: selectedOption };
    let finalCorrect = 0;
    questions.forEach((q, i) => {
      if (allAnswers[i] === q.correctAnswer) finalCorrect++;
    });

    const score = Math.round((finalCorrect / questions.length) * 100);

    try {
      const submitRes = await api.post('/quiz/submit', {
        userid: userId,
        subject: subject || 'Mixed',
        total_questions: questions.length,
        correct_answers: finalCorrect,
        time_taken_seconds: timer
      });
      setResults({ correct: finalCorrect, total: questions.length, score, grade: submitRes.data.grade, time: timer });
    } catch (err) {
      setResults({ correct: finalCorrect, total: questions.length, score, grade: 'N/A', time: timer });
    }
    setPhase('results');
    fetchHistory();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const question = questions[currentQ];

  return (
    <Layout title="Quiz Arena">
      {phase === 'setup' && (
        <>
          <Card>
            <div className="py-8 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 mb-4">
                <Brain size={40} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">AI Quiz Arena</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                Test your knowledge with auto-generated questions from your approved notes.
              </p>

              <div className="max-w-xs mx-auto mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Select Subject (optional)</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input-field text-center"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button onClick={startQuiz} disabled={loading} className="btn-primary text-base px-8 py-3">
                {loading ? 'Generating...' : <><Play size={20} /> Start Quiz</>}
              </button>
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card title="Recent Attempts">
              <div className="space-y-3">
                {history.slice(0, 8).map((attempt, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className={`p-2 rounded-lg ${attempt.score_percent >= 70 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                      {attempt.score_percent >= 70 ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{attempt.subject}</p>
                      <p className="text-xs text-slate-500">
                        {attempt.correct_answers}/{attempt.total_questions} correct •
                        {attempt.time_taken_seconds ? ` ${formatTime(attempt.time_taken_seconds)}` : ''}
                      </p>
                    </div>
                    <span className={`text-lg font-black ${attempt.score_percent >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {attempt.score_percent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {phase === 'playing' && question && (
        <>
          {/* Timer & Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500 font-medium">Question {currentQ + 1} / {questions.length}</span>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} />
              <span className="text-sm font-mono font-bold">{formatTime(timer)}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-purple-500 to-primary rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question Card */}
          <Card>
            <div className="py-4">
              <p className="text-xs text-primary uppercase tracking-wider font-bold mb-1">{question.subject} • {question.chapter}</p>
              <h2 className="text-lg font-bold text-white leading-relaxed mb-6 whitespace-pre-line">{question.question}</h2>

              <div className="space-y-3">
                {question.options.map((opt, i) => {
                  let optClass = 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20';
                  if (revealed) {
                    if (opt === question.correctAnswer) optClass = 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400';
                    else if (opt === selectedOption) optClass = 'bg-red-400/10 border-red-400/30 text-red-400';
                    else optClass = 'bg-white/[0.01] border-white/5 opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={revealed}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${optClass} ${!revealed ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-medium text-white">{opt}</span>
                        {revealed && opt === question.correctAnswer && <CheckCircle size={18} className="ml-auto text-emerald-400" />}
                        {revealed && opt === selectedOption && opt !== question.correctAnswer && <XCircle size={18} className="ml-auto text-red-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="mt-6 flex justify-end">
                  <button onClick={nextQuestion} className="btn-primary">
                    {currentQ + 1 >= questions.length ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {phase === 'results' && results && (
        <Card>
          <div className="py-12 text-center">
            <div className="text-6xl mb-4">{results.score >= 70 ? '🎉' : '📚'}</div>
            <h2 className="text-3xl font-black text-white mb-2">Quiz Complete!</h2>
            <p className="text-slate-400 mb-1">Grade: <span className="text-primary font-black text-xl">{results.grade}</span></p>
            <p className="text-slate-500 text-sm mb-8">Time: {formatTime(results.time)}</p>

            <div className="flex items-center justify-center gap-10 mb-8">
              <div className="text-center">
                <p className={`text-4xl font-black ${results.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>{results.score}%</p>
                <p className="text-xs text-slate-500 uppercase mt-1">Score</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-emerald-400">{results.correct}</p>
                <p className="text-xs text-slate-500 uppercase mt-1">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-red-400">{results.total - results.correct}</p>
                <p className="text-xs text-slate-500 uppercase mt-1">Wrong</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { setPhase('setup'); }} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">
                Back to Setup
              </button>
              <button onClick={startQuiz} className="btn-primary">
                <RotateCcw size={18} /> Try Again
              </button>
            </div>
          </div>
        </Card>
      )}
    </Layout>
  );
};
