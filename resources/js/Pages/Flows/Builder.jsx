import { useState, useCallback, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Phone, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlowBuilderComponent from '@/Components/FlowBuilder';
import FlowCommentPanel from '@/Components/FlowCommentPanel';
import FlowVersionPanel from '@/Components/FlowVersionPanel';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Alert, AlertTitle, AlertDescription, AlertActions, AlertBody } from '@/Components/catalyst/alert';
import { update } from '@/actions/App/Http/Controllers/Web/FlowController';

const TABS = {
  builder: 'Builder',
  comments: 'Comments',
  history: 'History',
};

export default function Builder({ flow }) {
  const [config, setConfig] = useState(flow.config);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulateResults, setSimulateResults] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const dirtyRef = useRef(false);
  const builderRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  const handleDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    builderRef.current?.syncToConfig();
    setSaving(true);

    setTimeout(() => {
      router.patch(update({ flow: flow.id }).url, {
        name: flow.name,
        description: flow.description,
        phone_number: flow.phone_number,
        is_active: flow.is_active,
        config: JSON.stringify(config),
      }, {
        onSuccess: () => {
          toast.success('Flow saved');
          dirtyRef.current = false;
          setDirty(false);
        },
        onError: () => toast.error('Failed to save flow'),
        onFinish: () => setSaving(false),
        preserveScroll: true,
      });
    }, 0);
  }, [flow, config]);

  const handleTestFlow = useCallback(async () => {
    if (!testPhone || testPhone.trim() === '') {
      toast.error('Please enter a phone number');
      return;
    }
    setTesting(true);
    try {
      await axios.post(`/flows/${flow.id}/test`, {
        phone_number: testPhone,
      });
      toast.success('Test call initiated');
      setShowTestModal(false);
      setTestPhone('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate test call');
    } finally {
      setTesting(false);
    }
  }, [flow.id, testPhone]);

  const handleSimulate = useCallback(async () => {
    setSimulating(true);
    try {
      const res = await axios.get(`/flows/${flow.id}/simulate`);
      setSimulateResults(res.data);
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimulating(false);
    }
  }, [flow.id]);

  return (
    <AuthenticatedLayout>
      <Head title={flow.name} />

      <div className="flex items-center gap-3">
        <Link href="/flows" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" />
        </Link>
        <Heading>{flow.name}</Heading>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          v{flow.version}
        </span>
      </div>

      <div className="mt-4 flex h-[calc(100vh-12rem)] flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {Object.entries(TABS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  activeTab === key
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {dirty && activeTab === 'builder' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Unsaved
              </span>
            )}
            {activeTab === 'builder' && (
              <>
                <Button outline onClick={() => setShowTestModal(true)}>
                  <Phone className="size-4" />
                  Test Flow
                </Button>
                <Button outline onClick={handleSimulate} disabled={simulating}>
                  <Play className="size-4" />
                  {simulating ? 'Simulating...' : 'Simulate'}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Flow'}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-950/5 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <AnimatePresence mode="wait">
            {activeTab === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <FlowBuilderComponent
                  ref={builderRef}
                  config={config}
                  onConfigChange={handleConfigChange}
                  onDirty={handleDirty}
                  onSave={handleSave}
                />
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <FlowCommentPanel flowId={flow.id} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <FlowVersionPanel flowId={flow.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showTestModal && (
          <Alert open={showTestModal} onClose={() => setShowTestModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <AlertTitle>Test Flow: {flow.name}</AlertTitle>
              <AlertDescription>
                Enter a phone number to call and test this flow.
              </AlertDescription>
              <AlertBody>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </AlertBody>
              <AlertActions>
                <Button plain onClick={() => setShowTestModal(false)}>Cancel</Button>
                <Button onClick={handleTestFlow} disabled={testing}>
                  {testing ? 'Calling...' : 'Call Now'}
                </Button>
              </AlertActions>
            </motion.div>
          </Alert>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {simulateResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            >
            <h3 className="text-lg font-semibold">Simulation Results</h3>
            <Text className="mt-1">{simulateResults.steps_count} steps simulated</Text>
            <div className="mt-4 space-y-2">
              {simulateResults.results.map((r, i) => (
                <div key={i} className={`rounded-lg border p-3 ${
                  r.status === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20' :
                  'border-zinc-200 dark:border-zinc-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {r.step_id}
                    </span>
                    <Badge color={r.status === 'error' ? 'red' : 'zinc'}>{r.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm">{r.output}</p>
                  {r.error && <p className="mt-0.5 text-xs text-red-600">{r.error}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSimulateResults(null)}>Close</Button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AuthenticatedLayout>
  );
}
