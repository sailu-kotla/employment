import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, BookOpen, CheckCircle, AlertTriangle, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import { Opportunity, UserProfile, AIAnalysisResult } from '../types.ts';
import { queryAIAssistant } from '../services/api.ts';

interface AIAssistantProps {
  opportunity: Opportunity;
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  opportunity,
  user,
  isOpen,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const sampleQuestions = [
    'Why is this job suitable for me?',
    'What skills am I missing?',
    'What should I learn before applying?',
    'How can I prepare for this interview?',
    'Am I a good match for this job?',
  ];

  const handleAnalyze = async (customPrompt?: string) => {
    const activeQuestion = customPrompt !== undefined ? customPrompt : question;
    setLoading(true);
    setErrorNotice(null);

    try {
      const result = await queryAIAssistant({
        question: activeQuestion || 'Provide a complete match breakdown and interview advice',
        userSkills: user?.skills || [],
        userEducation: user?.education,
        jobTitle: opportunity.title,
        jobCompany: opportunity.company,
        jobCategory: opportunity.category,
        jobExperience: opportunity.experience,
        jobDescription: opportunity.description,
        jobSkills: opportunity.skills,
      });
      setAnalysis(result);
    } catch (err: any) {
      console.warn('AI query error:', err);
      setErrorNotice('AI assistant is temporarily unavailable. Showing basic recommendations instead.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial analysis automatically when modal opens
  useEffect(() => {
    if (isOpen && !analysis) {
      handleAnalyze('Why is this job suitable for me?');
    }
  }, [isOpen, opportunity._id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img
              src="/nearwork-logo.jpg"
              alt="NearWork Logo"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">NearWork Smart Assistant</h2>
              <p className="text-xs text-slate-500">
                Match breakdown for <span className="font-semibold text-indigo-600">{opportunity.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            id="close-ai-assistant-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Active Opportunity Summary Chip */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800">{opportunity.title}</span>
              <span className="text-slate-500 ml-1.5">at {opportunity.company} ({opportunity.location})</span>
            </div>
            <span className="font-bold text-indigo-600">{opportunity.salary}</span>
          </div>

          {/* Quick Questions Prompts */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select a Question:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    handleAnalyze(q);
                  }}
                  disabled={loading}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 transition-all text-left cursor-pointer"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) handleAnalyze(question);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your own question..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              id="ai-question-input"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              id="send-ai-question-btn"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask AI</span>
            </button>
          </form>

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">Analyzing your profile match...</p>
              <p className="text-xs text-slate-400 mt-1">Comparing against {opportunity.company} requirements</p>
            </div>
          )}

          {/* Analysis Cards Output */}
          {!loading && analysis && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-300">
              {/* Top Banner in Sleek Deep Indigo */}
              <div className="bg-indigo-900 rounded-xl p-5 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Assessment</div>
                  <h4 className="text-white font-bold text-sm mt-0.5">{opportunity.title}</h4>
                  <p className="text-xs text-indigo-100 mt-1 max-w-md italic leading-relaxed">
                    "{analysis.suitabilitySummary || analysis.whyItMatches}"
                  </p>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Match Score</div>
                  <div className="text-2xl font-bold text-white">{analysis.matchScore}%</div>
                  <span className="text-[10px] uppercase font-bold text-indigo-200 px-2 py-0.5 rounded bg-indigo-800 inline-block mt-1">
                    {analysis.mode === 'gemini' ? 'Gemini 3.8' : 'Rule Engine'}
                  </span>
                </div>
              </div>

              {/* 1. Why it matches */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Match Rationale
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {analysis.whyItMatches}
                </p>
              </div>

              {/* 2. Strengths & Skill Gaps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Strengths */}
                <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/40">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Your Strengths ({analysis.strengths.length})
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {analysis.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-medium">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skill Gaps */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Skills to Bridge ({analysis.skillGaps.length})
                  </h4>
                  {analysis.skillGaps.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-700">
                      {analysis.skillGaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 font-medium">
                          <span className="text-slate-400 line-through">✗</span>
                          <span className="text-slate-600">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-indigo-700 font-medium">All required technical skills met!</p>
                  )}
                </div>
              </div>

              {/* 3. Recommendations */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Preparation Steps
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-medium pt-0.5">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Interview Preparation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Interview Checklist
                </h4>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                  {analysis.interviewPreparation.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Free student guidance • No paid API required</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
