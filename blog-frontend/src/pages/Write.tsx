import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  PanelRight,
  PanelRightClose,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  X,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import useBlogStore from '../store/blogStore';
import InsightsPanel, { NLPResult } from '../components/NLPPanel';
import Button from '../components/ui/Button';
import { stripHtml } from '../lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface ModerationFlag {
  category: string;
  severity: 'high' | 'medium' | 'low';
  matched_text: string;
  suggestion: string | null;
}

interface ModerationResult {
  allowed: boolean;
  sentiment: string;
  sentiment_score: number;
  toxicity_score: number;
  flags: ModerationFlag[];
  flag_categories: string[];
  reason: string | null;
  suggestion: string | null;
  fallback?: boolean;
}

// ── Tone Indicator Component ─────────────────────────────────────────────────

function ToneIndicator({ sentiment, score }: { sentiment: string | null; score: number }) {
  if (!sentiment) return null;

  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    POSITIVE: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Positive' },
    NEGATIVE: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Negative' },
    NEUTRAL:  { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Neutral' },
  };

  const c = config[sentiment] || config.NEUTRAL;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg} transition-all duration-300`}>
      <TrendingUp size={13} className={c.text} />
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-semibold ${c.text}`}>
        Tone: {c.label}
      </span>
      <span className={`text-[10px] ${c.text} opacity-60`}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

// ── Moderation Blocked Modal ─────────────────────────────────────────────────

function ModerationBlockedModal({
  result,
  onClose,
  onRewrite,
  rewriting,
}: {
  result: ModerationResult;
  onClose: () => void;
  onRewrite: () => void;
  rewriting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <ShieldAlert size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900 dark:text-red-200">Content Blocked</h3>
              <p className="text-xs text-red-600 font-medium">
                Toxicity Score: {Math.round(result.toxicity_score * 100)}%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Reason */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.reason}
            </p>
          </div>

          {/* Flagged Content */}
          {result.flags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Flagged Content
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.flags.map((flag, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      flag.severity === 'high'
                        ? 'bg-red-50 border-red-100'
                        : flag.severity === 'medium'
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <AlertCircle
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${
                        flag.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          flag.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {flag.category.replace('_', ' ')}
                        </span>
                        <code className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          "{flag.matched_text}"
                        </code>
                      </div>
                      {flag.suggestion && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          💡 {flag.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion */}
          {result.suggestion && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
              <RefreshCw size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-700 leading-relaxed">
                {result.suggestion}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Edit Manually
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onRewrite}
            loading={rewriting}
            icon={!rewriting ? <RefreshCw size={14} /> : undefined}
          >
            {rewriting ? 'Rewriting...' : 'Improve Tone with AI'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Write Component ─────────────────────────────────────────────────────

const Write: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [analysis, setAnalysis] = useState<NLPResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();
  const { createPost } = useBlogStore();

  // Moderation state
  const [moderating, setModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  // Real-time tone tracking (lightweight — from auto-analysis)
  const [liveTone, setLiveTone] = useState<{ sentiment: string | null; score: number }>({
    sentiment: null,
    score: 0,
  });

  // Debounced auto-analysis
  useEffect(() => {
    const textOnly = stripHtml(content).trim();

    if (!textOnly || textOnly.length < 10) {
      if (!textOnly) {
        setAnalysis(null);
        setLiveTone({ sentiment: null, score: 0 });
      }
      return;
    }

    const handler = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const response = await api.post('/nlp/analyse', { text: textOnly });
        setAnalysis(response.data);

        // Update live tone from analysis
        if (response.data?.sentiment) {
          setLiveTone({
            sentiment: response.data.sentiment.label,
            score: response.data.sentiment.score || response.data.sentiment.confidence || 0,
          });
        }
      } catch {
        // failed silently
      } finally {
        setAnalyzing(false);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [content]);

  // Update tags if NLP returns keywords and tags is empty
  useEffect(() => {
    if (analysis?.keywords?.top_keyword && !tags) {
      setTags(analysis.keywords.keywords.map((k: any) => k.keyword).join(', '));
    }
  }, [analysis, tags]);

  const handleApplyGrammarFix = () => {
    if (analysis?.grammar?.corrected_text) {
      setContent(analysis.grammar.corrected_text);
    }
  };

  // ── Pre-publish moderation gate ────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;

    const textOnly = stripHtml(content).trim();

    // Edge case: very short content — skip moderation
    if (textOnly.length < 10) {
      setPublishing(true);
      try {
        await createPost(title, content, tags);
        navigate('/');
      } finally {
        setPublishing(false);
      }
      return;
    }

    // Step 1: Run moderation check
    setModerating(true);
    try {
      const moderationResponse = await api.post('/nlp/moderate', { text: textOnly });
      const result: ModerationResult = moderationResponse.data;
      setModerationResult(result);

      if (!result.allowed) {
        // BLOCKED — show modal
        setShowBlockedModal(true);
        setModerating(false);
        return;
      }

      // ALLOWED — proceed to publish
      setModerating(false);
      setPublishing(true);
      await createPost(title, content, tags);
      navigate('/');

    } catch (err) {
      console.error('Moderation check failed:', err);
      // Fallback: allow publish if moderation service is down
      setModerating(false);
      setPublishing(true);
      try {
        await createPost(title, content, tags);
        navigate('/');
      } finally {
        setPublishing(false);
      }
    } finally {
      setPublishing(false);
    }
  }, [title, content, tags, createPost, navigate]);

  // ── AI Rewrite Handler ─────────────────────────────────────────────────────
  const handleRewrite = useCallback(async () => {
    const textOnly = stripHtml(content).trim();
    setRewriting(true);
    try {
      const response = await api.post('/nlp/rewrite', { text: textOnly });
      if (response.data?.rewritten) {
        setContent(response.data.rewritten);
        setShowBlockedModal(false);
        setModerationResult(null);
      }
    } catch {
      console.error('Rewrite failed');
    } finally {
      setRewriting(false);
    }
  }, [content]);

  const hasContent = stripHtml(content).trim().length > 0;
  const isSpam = analysis?.spam?.is_spam === true;
  const isPublishDisabled = publishing || moderating || !title.trim() || !hasContent || isSpam;

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* ── Center: Editor ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Title Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 sm:p-6">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Post Title
            </label>
            <input
              id="post-title"
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight focus:outline-none bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
            />
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Category & Tags
            </label>
            <input
              id="post-tags"
              type="text"
              placeholder="e.g. technology, design, frontend (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-sm font-medium focus:outline-none bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Editor Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Content
              </label>
              {/* Real-time Tone Indicator */}
              <ToneIndicator sentiment={liveTone.sentiment} score={liveTone.score} />
            </div>
            <div className="min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Start writing your amazing story..."
              />
            </div>
          </div>

          {/* Inline Warnings (non-blocking, real-time) */}
          {liveTone.sentiment === 'NEGATIVE' && liveTone.score > 0.3 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 animate-fade-in">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Your content has a negative tone
                </p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  Consider rephrasing to adopt a more constructive tone. Content with high negativity may be blocked by the moderation system.
                </p>
              </div>
            </div>
          )}

          {/* Spam Warning */}
          {isSpam && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 animate-fade-in">
              <ShieldAlert size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Spam detected — publishing is disabled
                </p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  Our AI detected promotional or spam-like patterns. Please revise your content.
                </p>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 pb-2">
            <Button
              variant={panelOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPanelOpen(!panelOpen)}
              icon={panelOpen ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
            >
              {panelOpen ? 'Hide Insights' : 'AI Insights'}
            </Button>

            <div className="flex items-center gap-3">
              {/* Moderation Status Badge */}
              {moderationResult?.allowed === true && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={13} />
                  Content approved
                </span>
              )}

              {isSpam && (
                <span className="text-xs text-red-600 font-medium hidden sm:flex items-center gap-1">
                  <AlertTriangle size={13} />
                  Spam detected
                </span>
              )}

              <Button
                onClick={handlePublish}
                disabled={isPublishDisabled}
                loading={moderating || publishing}
                icon={
                  moderating ? <Shield size={15} /> :
                  !publishing ? <Send size={15} /> :
                  undefined
                }
              >
                {moderating
                  ? 'Checking Content...'
                  : publishing
                  ? 'Publishing...'
                  : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: NLP Insights Panel ──────────────────────── */}
      {panelOpen && (
        <div className="w-full md:w-[320px] h-[400px] md:h-full flex-shrink-0">
          <InsightsPanel
            analysis={analysis}
            analyzing={analyzing}
            onApplyGrammarFix={handleApplyGrammarFix}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}

      {/* ── Moderation Blocked Modal ──────────────────────── */}
      {showBlockedModal && moderationResult && !moderationResult.allowed && (
        <ModerationBlockedModal
          result={moderationResult}
          onClose={() => setShowBlockedModal(false)}
          onRewrite={handleRewrite}
          rewriting={rewriting}
        />
      )}
    </div>
  );
};

export default Write;
