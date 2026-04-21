import React from 'react';
import { X, Loader2, TrendingUp, Hash, Shield, FileText, MapPin } from 'lucide-react';

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

/* ─── Insight Card Shell ─────────────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg rounded-2xl border border-border p-4 animate-fade-in shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">{icon}</span>
        <h4 className="text-[12px] font-bold tracking-wide uppercase text-text-tertiary">{title}</h4>
      </div>
      {badge}
    </div>
  );
}

/* ─── Sentiment Card ─────────────────────────────────────────── */
function SentimentCard({ data }: { data: NLPResult['sentiment'] }) {
  if (!data) return null;

  const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    POSITIVE: { bg: 'bg-positive-bg', text: 'text-positive', dot: 'bg-positive' },
    NEGATIVE: { bg: 'bg-negative-bg', text: 'text-negative', dot: 'bg-negative' },
    NEUTRAL: { bg: 'bg-neutral-tag-bg', text: 'text-neutral-tag', dot: 'bg-neutral-tag' },
  };

  const colors = colorMap[data.label] || colorMap.NEUTRAL;
  const confidence = Math.round((data.confidence || data.score) * 100);

  return (
    <Card>
      <CardTitle icon={<TrendingUp size={14} />} title="Sentiment" />
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.bg}`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className={`text-sm font-semibold ${colors.text}`}>
          {data.label}
        </span>
        <span className={`text-xs ${colors.text} opacity-70 ml-auto`}>
          {confidence}%
        </span>
      </div>
      <p className="text-[12px] text-text-tertiary mt-2 leading-relaxed italic">
        {data.summary}
      </p>
    </Card>
  );
}

/* ─── Keywords Card ──────────────────────────────────────────── */
function KeywordsCard({ data }: { data: NLPResult['keywords'] }) {
  if (!data || data.keywords.length === 0) return null;

  return (
    <Card>
      <CardTitle icon={<Hash size={14} />} title="Keywords" />
      <div className="flex flex-wrap gap-1.5">
        {data.keywords.slice(0, 8).map((kw, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2.5 py-1 bg-surface-hover text-text-secondary text-[11px] font-medium rounded-md hover:bg-surface-active transition-colors"
          >
            {kw.keyword}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── Summary Card ───────────────────────────────────────────── */
function SummaryCard({ data }: { data: NLPResult['summary'] }) {
  if (!data) return null;
  const reduction = Math.round((1 - (data.compression_ratio || 0)) * 100);

  return (
    <Card>
      <CardTitle
        icon={<FileText size={14} />}
        title="Summary"
        badge={
          <span className="text-[11px] font-medium text-text-quaternary">
            −{reduction}%
          </span>
        }
      />
      <p className="text-[13px] text-text-secondary leading-relaxed">
        {data.summary}
      </p>
    </Card>
  );
}

/* ─── Spam Card ──────────────────────────────────────────────── */
function SpamCard({ data }: { data: NLPResult['spam'] }) {
  if (!data) return null;

  return (
    <Card className={data.is_spam ? 'border-negative/30 bg-negative-bg' : ''}>
      <CardTitle
        icon={<Shield size={14} />}
        title="Spam Check"
        badge={
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            data.is_spam
              ? 'bg-negative/10 text-negative'
              : 'bg-positive/10 text-positive'
          }`}>
            {data.is_spam ? 'SPAM' : 'CLEAN'}
          </span>
        }
      />
      {data.is_spam && data.reasons.length > 0 && (
        <ul className="space-y-1 mt-1">
          {data.reasons.map((reason, i) => (
            <li key={i} className="text-[12px] text-negative flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-negative flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ─── Grammar Card ───────────────────────────────────────────── */
function GrammarCard({ data, onApply }: { data: NLPResult['grammar']; onApply: () => void }) {
  if (!data) return null;

  return (
    <Card>
      <CardTitle
        icon={<FileText size={14} />}
        title="Grammar"
        badge={
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            data.errors_found === 0
              ? 'bg-positive/10 text-positive'
              : 'bg-warning-bg text-warning'
          }`}>
            {data.errors_found} issue{data.errors_found !== 1 ? 's' : ''}
          </span>
        }
      />
      {data.errors_found > 0 && (
        <>
          <ul className="space-y-1.5 mb-3">
            {data.matches.slice(0, 4).map((match, i) => (
              <li key={i} className="text-[12px] text-text-secondary leading-relaxed">
                {match.message}
              </li>
            ))}
          </ul>
          <button
            onClick={onApply}
            className="text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-lg border border-border-strong hover:bg-surface-hover transition-colors"
          >
            Apply fixes
          </button>
        </>
      )}
    </Card>
  );
}

/* ─── NER Card ───────────────────────────────────────────────── */
function NERCard({ data }: { data: NLPResult['ner'] }) {
  if (!data || data.entities.length === 0) return null;

  return (
    <Card>
      <CardTitle
        icon={<MapPin size={14} />}
        title="Entities"
        badge={
          <span className="text-[11px] font-medium text-text-quaternary">
            {data.entity_count} found
          </span>
        }
      />
      <div className="space-y-2">
        {Object.entries(data.grouped).slice(0, 5).map(([label, texts]) => (
          <div key={label} className="flex items-start gap-2">
            <span className="text-[10px] font-bold tracking-wide uppercase text-text-quaternary bg-surface-hover px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
              {label}
            </span>
            <span className="text-[12px] text-text-secondary leading-relaxed">
              {(texts as string[]).join(', ')}
            </span>
          </div>
        ))}
      </div>
    </Card>
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
    <div className="w-full md:w-[300px] flex-shrink-0 border-t md:border-t-0 md:border-l border-border bg-surface flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-tertiary">
          AI Insights
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-text-tertiary hover:text-text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {analyzing ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={20} className="text-text-tertiary animate-spin-slow" />
            <p className="text-[12px] text-text-quaternary tracking-wide">Analyzing...</p>
          </div>
        ) : !analysis ? (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-[12px] text-text-quaternary text-center leading-relaxed">
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
