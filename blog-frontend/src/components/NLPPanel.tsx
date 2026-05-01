import React from 'react';
import { X, Loader2, TrendingUp, Hash, Shield, FileText, MapPin } from 'lucide-react';
import Card from './ui/Card';

export interface NLPResult {
  grammar?: {
    corrected_text: string;
    errors_found: number;
    matches: { message: string; rule_id: string }[];
  };
  keywords?: {
    keywords: { keyword: string; score: number }[];
    top_keyword: string | null;
  };
  sentiment?: {
    label: string;
    emoji: string;
    score: number;
    confidence: number;
    summary: string;
  };
  summary?: {
    summary: string;
    compression_ratio: number;
  };
  spam?: {
    is_spam: boolean;
    confidence: number;
    label: string;
    reasons: string[];
  };
  ner?: {
    entities: { text: string; label: string; description: string }[];
    entity_count: number;
    grouped: Record<string, string[]>;
  };
}

interface InsightsPanelProps {
  analysis: NLPResult | null;
  analyzing: boolean;
  onApplyGrammarFix: () => void;
  onClose: () => void;
}

/* ─── Section Title ──────────────────────────────────────────── */
function SectionTitle({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <h4 className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">{title}</h4>
      </div>
      {badge}
    </div>
  );
}

/* ─── Sentiment Card ─────────────────────────────────────────── */
function SentimentCard({ data }: { data: NLPResult['sentiment'] }) {
  if (!data) return null;

  const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    POSITIVE: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    NEGATIVE: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    NEUTRAL: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  };

  const colors = colorMap[data.label] || colorMap.NEUTRAL;
  const confidence = Math.round((data.confidence || data.score) * 100);

  return (
    <div className="animate-fade-in animate-delay-1">
      <SectionTitle icon={<TrendingUp size={14} />} title="Sentiment" />
      <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${colors.bg}`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className={`text-sm font-semibold ${colors.text}`}>{data.label}</span>
        <span className={`text-xs ${colors.text} opacity-60 ml-auto`}>{confidence}%</span>
      </div>
      {data.summary && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">{data.summary}</p>
      )}
    </div>
  );
}

/* ─── Keywords Card ──────────────────────────────────────────── */
function KeywordsCard({ data }: { data: NLPResult['keywords'] }) {
  if (!data || data.keywords.length === 0) return null;

  return (
    <div className="animate-fade-in animate-delay-2">
      <SectionTitle icon={<Hash size={14} />} title="Keywords" />
      <div className="flex flex-wrap gap-1.5">
        {data.keywords.slice(0, 8).map((kw, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {kw.keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Summary Card ───────────────────────────────────────────── */
function SummaryCard({ data }: { data: NLPResult['summary'] }) {
  if (!data) return null;
  const reduction = Math.round((1 - (data.compression_ratio || 0)) * 100);

  return (
    <div className="animate-fade-in animate-delay-1">
      <SectionTitle
        icon={<FileText size={14} />}
        title="Summary"
        badge={
          <span className="text-[11px] font-medium text-slate-400">−{reduction}%</span>
        }
      />
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.summary}</p>
    </div>
  );
}

/* ─── Spam Card ──────────────────────────────────────────────── */
function SpamCard({ data }: { data: NLPResult['spam'] }) {
  if (!data) return null;

  return (
    <div className={`animate-fade-in rounded-xl p-3.5 border ${
      data.is_spam
        ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20'
        : 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20'
    }`}>
      <SectionTitle
        icon={<Shield size={14} />}
        title="Spam Check"
        badge={
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
            data.is_spam
              ? 'bg-red-100 text-red-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {data.is_spam ? 'SPAM' : 'CLEAN'}
          </span>
        }
      />
      {data.is_spam && data.reasons.length > 0 && (
        <ul className="space-y-1 mt-1">
          {data.reasons.map((reason, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Grammar Card ───────────────────────────────────────────── */
function GrammarCard({ data, onApply }: { data: NLPResult['grammar']; onApply: () => void }) {
  if (!data) return null;

  return (
    <div className="animate-fade-in animate-delay-2">
      <SectionTitle
        icon={<FileText size={14} />}
        title="Grammar"
        badge={
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
            data.errors_found === 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {data.errors_found} issue{data.errors_found !== 1 ? 's' : ''}
          </span>
        }
      />
      {data.errors_found > 0 && (
        <>
          <ul className="space-y-1.5 mb-3">
            {data.matches.slice(0, 4).map((match, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {match.message}
              </li>
            ))}
          </ul>
          <button
            onClick={onApply}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
          >
            Apply fixes
          </button>
        </>
      )}
    </div>
  );
}

/* ─── NER Card ───────────────────────────────────────────────── */
function NERCard({ data }: { data: NLPResult['ner'] }) {
  if (!data || data.entities.length === 0) return null;

  return (
    <div className="animate-fade-in animate-delay-3">
      <SectionTitle
        icon={<MapPin size={14} />}
        title="Entities"
        badge={
          <span className="text-[11px] font-medium text-slate-400">{data.entity_count} found</span>
        }
      />
      <div className="space-y-2">
        {Object.entries(data.grouped).slice(0, 5).map(([label, texts]) => (
          <div key={label} className="flex items-start gap-2">
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
              {label}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {(texts as string[]).join(', ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────── */
const InsightsPanel: React.FC<InsightsPanelProps> = ({
  analysis,
  analyzing,
  onApplyGrammarFix,
  onClose,
}) => {
  return (
    <div className="w-full md:w-[300px] flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">
          AI Insights
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {analyzing ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={22} className="text-indigo-600 animate-spin-slow" />
            <p className="text-xs text-slate-400 font-medium">Analyzing your content...</p>
          </div>
        ) : !analysis ? (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Start writing to see AI insights magically appear here.
            </p>
          </div>
        ) : (
          <>
            <SpamCard data={analysis.spam} />
            <SentimentCard data={analysis.sentiment} />
            <SummaryCard data={analysis.summary} />
            <GrammarCard data={analysis.grammar} onApply={onApplyGrammarFix} />
            <KeywordsCard data={analysis.keywords} />
            <NERCard data={analysis.ner} />
          </>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
