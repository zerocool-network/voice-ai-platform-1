import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MessageSquare, HelpCircle, PhoneOff,
  GitBranch, ArrowRight, Bot, Webhook,
  PhoneForwarded, BookOpen, Mic, Activity, Brain, Cpu,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const iconMap = {
  say: MessageSquare,
  ask: HelpCircle,
  hangup: PhoneOff,
  condition: GitBranch,
  goto: ArrowRight,
  llm: Bot,
  webhook: Webhook,
  mcp_tool: Cpu,
  transfer: PhoneForwarded,
  knowledge: BookOpen,
  voice_agent: Mic,
  analyze: Activity,
  memory: Brain,
};

const CATEGORIES = [
  {
    labelKey: 'ui.basic',
    items: ['say', 'ask', 'hangup'],
  },
  {
    labelKey: 'ui.ai',
    items: ['llm', 'knowledge', 'voice_agent'],
  },
  {
    labelKey: 'ui.flow_control',
    items: ['condition', 'goto'],
  },
  {
    labelKey: 'ui.actions',
    items: ['transfer', 'webhook', 'mcp_tool'],
  },
  {
    labelKey: 'ui.intelligence',
    items: ['analyze', 'memory'],
  },
];

const NODE_ITEMS = [
  { type: 'say', label: 'Say', color: 'emerald', desc: 'Text-to-speech response' },
  { type: 'ask', label: 'Ask', color: 'violet', desc: 'Gather caller input' },
  { type: 'llm', label: 'LLM', color: 'blue', desc: 'AI prompt' },
  { type: 'condition', label: 'Condition', color: 'amber', desc: 'Branch logic' },
  { type: 'goto', label: 'Goto', color: 'orange', desc: 'Jump to step' },
  { type: 'transfer', label: 'Transfer', color: 'rose', desc: 'Call transfer' },
  { type: 'webhook', label: 'Webhook', color: 'cyan', desc: 'HTTP request' },
  { type: 'mcp_tool', label: 'MCP Tool', color: 'purple', desc: 'Call MCP tool' },
  { type: 'knowledge', label: 'Knowledge', color: 'teal', desc: 'Query knowledge base' },
  { type: 'voice_agent', label: 'Voice Agent', color: 'purple', desc: 'Conversation Relay AI' },
  { type: 'analyze', label: 'Analyze', color: 'indigo', desc: 'Conversation Intelligence' },
  { type: 'memory', label: 'Memory', color: 'cyan', desc: 'Load customer profile' },
  { type: 'hangup', label: 'Hangup', color: 'red', desc: 'End call' },
];

const colorMap = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  orange: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
  teal: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300',
  purple: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300',
};

const miniColorMap = {
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
};

function DraggableItem({ type, label, color, desc, isSearching }) {
  const Icon = iconMap[type];

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`group flex cursor-grab items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing active:scale-[0.98] ${colorMap[color]}`}
      draggable
      onDragStart={onDragStart}
    >
      <span className={`size-2.5 shrink-0 rounded-full ${miniColorMap[color]} ring-2 ring-white`} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] font-semibold leading-tight">{label}</span>
        {!isSearching && (
          <span className="text-[11px] leading-tight opacity-55">{desc}</span>
        )}
      </div>
      {Icon && <Icon className="ml-auto size-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-70" />}
    </div>
  );
}

export default function Toolbox() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState(CATEGORIES.map((_, i) => i));

  const toggleCategory = (i) => {
    setOpenCategories((prev) =>
      prev.includes(i) ? prev.filter((idx) => idx !== i) : [...prev, i]
    );
  };

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    label: t(cat.labelKey),
    items: cat.items.filter((type) => {
      if (!search.trim()) return true;
      const item = NODE_ITEMS.find((n) => n.type === type);
      const q = search.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q)
      );
    }),
  })).filter((cat) => cat.items.length > 0);

  const isSearching = search.trim().length > 0;

  return (
    <div className="flex w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/80 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-cyan-500" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{t('ui.steps_toolbox')}</span>
      </div>

      <label className="mb-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-3 shadow-sm focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500/10">
        <Search className="size-3.5 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder={t('ui.search_nodes')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {isSearching ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            {filteredCategories.flatMap((cat) =>
              cat.items.map((type) => {
                const item = NODE_ITEMS.find((n) => n.type === type);
                return <DraggableItem key={type} {...item} isSearching />;
              })
            )}
          </motion.div>
        ) : (
          filteredCategories.map((cat, i) => {
            const isOpen = openCategories.includes(i);
            return (
              <div key={cat.labelKey} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(i)}
                  className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 hover:bg-slate-100/80 hover:text-slate-600"
                >
                  <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                  {cat.label}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="flex flex-col gap-2 overflow-hidden pb-0.5"
                    >
                      {cat.items.map((type) => {
                        const item = NODE_ITEMS.find((n) => n.type === type);
                        return <DraggableItem key={type} {...item} />;
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
        {filteredCategories.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400">{t('ui.no_matching_nodes')}</p>
        )}
      </div>
    </div>
  );
}
