import { useState, useCallback, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Phone, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import FlowBuilderComponent from '@/Components/FlowBuilder';
import FlowCommentPanel from '@/Components/FlowCommentPanel';
import FlowVersionPanel from '@/Components/FlowVersionPanel';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Alert, AlertTitle, AlertDescription, AlertActions, AlertBody } from '@/Components/catalyst/alert';
import { update } from '@/actions/App/Http/Controllers/Web/FlowController';
import { useTranslation } from '@/hooks/useTranslation';

const TAB_KEYS = ['builder', 'comments', 'history'];

export default function Builder({ flow, languages = {}, speechVoices = {} }) {
  const { t } = useTranslation();
  const [config, setConfig] = useState(flow.config);
  const [language, setLanguage] = useState(flow.language ?? 'en-US');
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

  const speechVoice = speechVoices[language] ?? 'Polly.Joanna';

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

  const persistFlow = useCallback((onSuccess, onError) => {
    const synced = builderRef.current?.syncToConfig();
    const nextConfig = synced ?? config;
    setConfig(nextConfig);
    setSaving(true);

    router.patch(update({ flow: flow.id }).url, {
      name: flow.name,
      description: flow.description,
      phone_number: flow.phone_number,
      language,
      is_active: flow.is_active,
      config: JSON.stringify(nextConfig),
    }, {
      onSuccess: () => {
        dirtyRef.current = false;
        setDirty(false);
        onSuccess?.();
      },
      onError: () => {
        toast.error(t('ui.flow_save_failed') || 'Failed to save flow');
        onError?.();
      },
      onFinish: () => setSaving(false),
      preserveScroll: true,
    });
  }, [flow, config, language, t]);

  const handleSave = useCallback(() => {
    persistFlow(() => toast.success(t('ui.flow_saved') || 'Flow saved'));
  }, [persistFlow, t]);

  const handleTestFlow = useCallback(() => {
    if (!testPhone || testPhone.trim() === '') {
      toast.error('Please enter a phone number');
      return;
    }

    const runTest = async () => {
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
    };

    if (dirtyRef.current) {
      setTesting(true);
      toast.message(t('ui.test_flow_saving_first') || 'Saving changes before test call…');
      persistFlow(
        () => {
          toast.success(t('ui.flow_saved') || 'Flow saved');
          runTest();
        },
        () => setTesting(false),
      );
      return;
    }

    runTest();
  }, [flow.id, testPhone, persistFlow, t]);

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
      <Head title={`${t('ui.flow_builder')} — ${flow.name}`} />

      <PageHeader
        eyebrow={t('ui.flow_builder')}
        title={flow.name}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Link href="/flows" className="inline-flex items-center gap-1 text-slate-500 transition hover:text-slate-800">
              <ArrowLeft className="size-3.5" />
              {t('navigation.flows') || 'Flows'}
            </Link>
            <span className="text-slate-300">·</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              v{flow.version}
            </span>
          </span>
        }
        actions={
          activeTab === 'builder' ? (
            <div className="flex flex-wrap items-center gap-2">
              {dirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {t('ui.unsaved')}
                </span>
              )}
              <Select
                aria-label={t('ui.flow_language')}
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                }}
                className="min-w-[10rem]"
              >
                {Object.entries(languages).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </Select>
              <Button outline onClick={() => setShowTestModal(true)}>
                <Phone className="size-4" />
                {t('ui.test_flow')}
              </Button>
              <Button outline onClick={handleSimulate} disabled={simulating}>
                <Play className="size-4" />
                {simulating ? t('ui.simulating') : t('ui.simulate')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('ui.saving') : t('ui.save_flow')}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="mt-6 flex h-[calc(100vh-11rem)] min-h-[32rem] flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
            {TAB_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  activeTab === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t(`ui.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
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
              <AlertTitle>{t('ui.test_flow_modal_title', { name: flow.name })}</AlertTitle>
              <AlertDescription>
                {t('ui.test_flow_modal_desc')}
              </AlertDescription>
              <AlertBody>
                <Text className="mb-3 text-sm text-slate-600">
                  {t('ui.test_flow_will_speak', { language, voice: speechVoice })
                    || `Will speak: ${language} · ${speechVoice}`}
                </Text>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </AlertBody>
              <AlertActions>
                <Button plain onClick={() => setShowTestModal(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleTestFlow} disabled={testing}>
                  {testing ? t('ui.calling') : t('ui.call_now')}
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
            <h3 className="text-lg font-semibold">{t('ui.simulation_results')}</h3>
            <Text className="mt-1">{t('ui.simulation_steps_simulated', { count: simulateResults.steps_count })}</Text>
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
              <Button onClick={() => setSimulateResults(null)}>{t('ui.close')}</Button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AuthenticatedLayout>
  );
}
