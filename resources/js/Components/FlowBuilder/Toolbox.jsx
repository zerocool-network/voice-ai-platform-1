import { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import {
  MessageSquare,
  HelpCircle,
  PhoneOff,
  GitBranch,
  ArrowRight,
  Bot,
  Webhook,
  PhoneForwarded,
  BookOpen,
  Mic,
  Activity,
} from 'lucide-react';

const iconMap = {
  say: MessageSquare,
  ask: HelpCircle,
  hangup: PhoneOff,
  condition: GitBranch,
  goto: ArrowRight,
  llm: Bot,
  webhook: Webhook,
  transfer: PhoneForwarded,
  knowledge: BookOpen,
  voice_agent: Mic,
  analyze: Activity,
};

const CATEGORIES = [
  {
    label: 'Basic',
    items: ['say', 'ask', 'hangup'],
  },
  {
    label: 'AI',
    items: ['llm', 'knowledge', 'voice_agent'],
  },
  {
    label: 'Flow Control',
    items: ['condition', 'goto'],
  },
  {
    label: 'Actions',
    items: ['transfer', 'webhook'],
  },
  {
    label: 'Intelligence',
    items: ['analyze'],
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
  { type: 'knowledge', label: 'Knowledge', color: 'teal', desc: 'Query knowledge base' },
  { type: 'voice_agent', label: 'Voice Agent', color: 'purple', desc: 'Conversation Relay AI' },
  { type: 'analyze', label: 'Analyze', color: 'indigo', desc: 'Conversation Intelligence' },
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

function DraggableItem({ type, label, color, desc }) {
  const Icon = iconMap[type];

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition hover:shadow-sm hover:scale-[1.02] active:cursor-grabbing active:scale-[0.98] ${colorMap[color]}`}
      draggable
      onDragStart={onDragStart}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span className="text-xs">{label}</span>
      <span className="text-[10px] font-normal opacity-60">{desc}</span>
    </div>
  );
}

export default function Toolbox() {
  const [search, setSearch] = useState('');

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
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

  return (
    <div className="flex w-56 flex-col gap-2 border-r bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Steps</div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-7 pr-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCategories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {cat.label}
            </div>
            <div className="flex flex-col gap-1.5">
              {cat.items.map((type) => {
                const item = NODE_ITEMS.find((n) => n.type === type);
                return <DraggableItem key={type} {...item} />;
              })}
            </div>
          </motion.div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-400">No matching nodes</p>
        )}
      </div>
    </div>
  );
}
