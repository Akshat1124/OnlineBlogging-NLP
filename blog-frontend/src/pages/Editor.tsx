import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Sparkles, Send, AlertTriangle, CheckCircle2, ListFilter, Quote } from 'lucide-react';
import Badge from '../components/Badge';
import { useNavigate } from 'react-router-dom';

interface NLPAnalysis {
  grammar: {
    corrected_text: string;
    errors_found: number;
    matches: any[];
  };
  keywords: {
    top_keyword: string;
    keywords: { keyword: string; score: number }[];
  };
  sentiment: {
    label: string;
    emoji: string;
    score: number;
    summary: string;
  };
  summary: {
    summary: string;
    compression_ratio: number;
  };
  spam: {
    is_spam: boolean;
    confidence: number;
    reasons: string[];
  };
}

const Editor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<NLPAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyse = async () => {
    if (!content.trim()) return toast.error('Add some content first!');
    
    setAnalyzing(true);
    try {
      // Strip HTML for analysis
      const textOnly = content.replace(/<[^>]*>/g, '');
      const response = await api.post('/nlp/analyse', { text: textOnly });
      setAnalysis(response.data);
      toast.success('AI Analysis complete!');
    } catch (error) {
      toast.error('AI Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) return toast.error('Title and content are required');
    if (analysis?.spam.is_spam) return toast.error('Cannot publish spam content');

    setPublishing(true);
    try {
      await api.post('/posts', { title, content });
      toast.success('Post published successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  const applyGrammarFix = () => {
    if (analysis?.grammar.corrected_text) {
      setContent(analysis.grammar.corrected_text);
      toast.success('Grammar fixes applied!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <input
              type="text"
              placeholder="Enter an inspiring title..."
              className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-slate-600 border-b border-slate-800 pb-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Write your story here..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'blockquote', 'code-block'],
                    ['clean']
                  ],
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handleAnalyse}
                disabled={analyzing || !content}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all font-medium disabled:opacity-50"
              >
                {analyzing ? (
                  <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
                <span>Analyse with AI</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={publishing || !title || !content || analysis?.spam.is_spam}
                className="btn-primary flex items-center space-x-2 px-8 py-2.5"
              >
                {publishing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                <span>Publish Post</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Panel Side */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Sparkles className="text-indigo-400" size={20} />
                <span>AI Analysis Panel</span>
              </h2>
              {analysis && (
                <Badge variant={analysis.spam.is_spam ? 'negative' : 'positive'}>
                  {analysis.spam.is_spam ? 'Spam Detected' : 'Verified'}
                </Badge>
              )}
            </div>

            {!analysis && !analyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-slate-600" size={32} />
                </div>
                <p className="text-slate-500">Write something and click "Analyse" to see AI insights.</p>
              </div>
            )}

            {analyzing && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 w-full bg-slate-800/50 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {analysis && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Spam Alert */}
                {analysis.spam.is_spam && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold">
                      <AlertTriangle size={18} />
                      <span>Spam Warning</span>
                    </div>
                    <p className="text-sm text-rose-300/80">This content has been flagged as spam ({Math.round(analysis.spam.confidence * 100)}% confidence).</p>
                    <ul className="text-xs text-rose-300/60 list-disc pl-4">
                      {analysis.spam.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {/* Sentiment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Sentiment</span>
                    <Badge variant={analysis.sentiment.label === 'POSITIVE' ? 'positive' : 'negative'}>
                      {analysis.sentiment.emoji} {analysis.sentiment.label}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl text-sm italic text-slate-300 border border-slate-700/50">
                    "{analysis.sentiment.summary}"
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400 flex items-center space-x-1">
                      <Quote size={14} />
                      <span>AI Summary</span>
                    </span>
                    <span className="text-xs text-indigo-400">-{Math.round((1 - analysis.summary.compression_ratio) * 100)}% shorter</span>
                  </div>
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-sm leading-relaxed text-indigo-100/80">
                    {analysis.summary.summary}
                  </div>
                </div>

                {/* Grammar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400 flex items-center space-x-1">
                      <CheckCircle2 size={14} />
                      <span>Grammar & Style</span>
                    </span>
                    <span className="text-xs text-amber-400">{analysis.grammar.errors_found} issues found</span>
                  </div>
                  {analysis.grammar.errors_found > 0 ? (
                    <button 
                      onClick={applyGrammarFix}
                      className="w-full py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm hover:bg-amber-500/20 transition-all"
                    >
                      Apply AI Corrections
                    </button>
                  ) : (
                    <div className="text-sm text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 size={16} />
                      <span>Perfectly written!</span>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-slate-400 flex items-center space-x-1">
                    <ListFilter size={14} />
                    <span>Top Keywords</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.keywords.map((k, i) => (
                      <Badge key={i} variant="indigo" className="cursor-default">
                        {k.keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
