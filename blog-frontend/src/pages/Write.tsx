import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { Send, PanelRight, PanelRightClose } from 'lucide-react';
import api from '../api/axios';
import useBlogStore from '../store/blogStore';
import InsightsPanel, { NLPResult } from '../components/NLPPanel';

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

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Debounced auto-analysis
  useEffect(() => {
    const textOnly = stripHtml(content).trim();
    
    // Don't analyze very short text snippet
    if (!textOnly || textOnly.length < 10) {
      if (!textOnly) {
         // Reset if empty
         setAnalysis(null);
      }
      return;
    }

    const handler = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const response = await api.post('/nlp/analyse', { text: textOnly });
        setAnalysis(response.data);
      } catch {
        // failed silently
      } finally {
        setAnalyzing(false);
      }
    }, 800); // 800ms debounce

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

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    if (analysis?.spam?.is_spam) return;

    setPublishing(true);
    try {
      await createPost(title, content, tags);
      navigate('/');
    } catch {
      // Publish failed
    } finally {
      setPublishing(false);
    }
  };

  const hasContent = stripHtml(content).trim().length > 0;

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-bg">
      {/* ── Center: Editor ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[800px] mx-auto space-y-6">
          
          {/* Title Section */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Post Title</label>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl md:text-4xl font-extrabold tracking-tight leading-tight focus:outline-none bg-transparent placeholder:text-text-quaternary text-text-primary"
            />
          </div>

          {/* Tags Section */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Category & Tags</label>
            <input
              type="text"
              placeholder="e.g. technology, design, frontend (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-[15px] font-medium focus:outline-none bg-transparent placeholder:text-text-quaternary text-text-secondary"
            />
          </div>

          {/* Editor Section */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
             <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Content</label>
             <div className="min-h-[400px]">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your amazing story..."
                  className="text-[17px] leading-relaxed text-text-primary"
                />
             </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border mt-16">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className={`flex items-center gap-2 text-[13px] font-medium px-4 py-2.5 rounded-full shadow-sm transition-all ${
                panelOpen 
                  ? 'text-accent-soft-text bg-accent-soft hover:bg-accent-soft/80' 
                  : 'text-text-secondary bg-surface border border-border-strong hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {panelOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              {panelOpen ? 'Hide Insights' : 'AI Insights'}
            </button>

            <div className="flex items-center gap-4">
              {analysis?.spam?.is_spam && (
                <span className="text-[12px] text-negative font-medium hidden sm:inline">
                  Spam detected
                </span>
              )}

              <button
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !hasContent || analysis?.spam?.is_spam === true}
                className="flex items-center gap-2 text-[13px] font-semibold tracking-wide bg-accent text-white px-6 py-2.5 rounded-full shadow-sm hover:bg-accent-hover hover:shadow disabled:opacity-50 transition-all"
              >
                <Send size={15} />
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom/Right: NLP Insights Panel ──────────────────────── */}
      {panelOpen && (
        <div className="w-full md:w-[320px] h-[400px] md:h-full flex-shrink-0 md:p-3 md:bg-bg md:border-l border-border">
          <div className="h-full bg-surface shadow-sm md:rounded-[20px] border border-border overflow-hidden">
            <InsightsPanel
              analysis={analysis}
              analyzing={analyzing}
              onApplyGrammarFix={handleApplyGrammarFix}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Write;
