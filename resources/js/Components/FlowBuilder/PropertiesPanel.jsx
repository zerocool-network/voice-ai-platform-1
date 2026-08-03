import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Plus, X, Settings2, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const FIELDS = {
  say: [
    { key: 'text', labelKey: 'ui.field_text', type: 'textarea', placeholder: 'What the AI says...' },
  ],
  ask: [
    { key: 'prompt', labelKey: 'ui.field_prompt', type: 'textarea', placeholder: 'Question to ask caller...' },
    {
      key: 'inputType', labelKey: 'ui.field_input_type', type: 'select',
      options: [
        { value: 'speech', labelKey: 'ui.option_speech' },
        { value: 'dtmf', labelKey: 'ui.option_dtmf' },
      ],
    },
    { key: 'variable', labelKey: 'ui.field_save_to_variable', type: 'input', placeholder: '$input' },
    { key: 'timeoutSec', labelKey: 'ui.field_timeout', type: 'input', placeholder: '10' },
  ],
  llm: [
    { key: 'systemPrompt', labelKey: 'ui.field_system_prompt', type: 'textarea', placeholder: 'You are a helpful assistant...' },
    { key: 'userPromptTemplate', labelKey: 'ui.field_user_prompt_template', type: 'textarea', placeholder: 'The caller said: {{input}}' },
    {
      key: 'model', labelKey: 'ui.field_model', type: 'select',
      options: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
      ],
    },
  ],
  condition: [
    {
      key: 'branches', labelKey: 'ui.field_branches', type: 'branches',
    },
    { key: 'elseNext', labelKey: 'ui.field_else_next', type: 'input', placeholder: 'Node ID...' },
  ],
  goto: [
    { key: 'target', labelKey: 'ui.field_target_step', type: 'input', placeholder: 'Enter node id...' },
  ],
  transfer: [
    {
      key: 'destination', labelKey: 'ui.field_type', type: 'select',
      options: [
        { value: 'number', labelKey: 'ui.option_phone_number' },
        { value: 'queue', labelKey: 'ui.option_queue' },
        { value: 'sip', labelKey: 'ui.option_sip_uri' },
      ],
    },
    { key: 'value', labelKey: 'ui.field_destination', type: 'input', placeholder: '+1 (555) 123-4567' },
  ],
  webhook: [
    { key: 'url', labelKey: 'ui.url', type: 'input', placeholder: 'https://example.com/api/hook' },
    {
      key: 'method', labelKey: 'ui.field_method', type: 'select',
      options: [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    { key: 'body', labelKey: 'ui.field_body_json', type: 'textarea', placeholder: '{"key": "{{variable}}"}' },
    { key: 'variable', labelKey: 'ui.field_save_response', type: 'input', placeholder: 'response_data' },
    { key: 'headers', labelKey: 'ui.field_headers', type: 'headers' },
    {
      key: 'auth_type', labelKey: 'ui.field_auth_type', type: 'select',
      options: [
        { value: '', labelKey: 'ui.option_no_auth' },
        { value: 'bearer', labelKey: 'ui.option_bearer_token' },
        { value: 'basic', labelKey: 'ui.option_basic_auth' },
      ],
    },
    { key: 'bearer_token', labelKey: 'ui.field_bearer_token', type: 'input', placeholder: 'sk-...', section: 'advanced' },
    { key: 'basic_username', labelKey: 'ui.field_basic_username', type: 'input', placeholder: 'username', section: 'advanced' },
    { key: 'basic_password', labelKey: 'ui.field_basic_password', type: 'input', placeholder: 'password', section: 'advanced' },
  ],
  mcp_tool: [
    { key: 'server', labelKey: 'ui.field_mcp_server', type: 'input', placeholder: 'e.g. sqlite' },
    { key: 'tool', labelKey: 'ui.field_tool_name', type: 'input', placeholder: 'list_tables' },
    { key: 'parameters', labelKey: 'ui.field_parameters_json', type: 'textarea', placeholder: '{"query": "SELECT 1"}' },
    { key: 'variable', labelKey: 'ui.field_save_result', type: 'input', placeholder: 'tool_result' },
  ],
  n8n_trigger: [
    { key: 'workflow_id', labelKey: 'ui.field_workflow_id', type: 'input', placeholder: 'n8n workflow id' },
    { key: 'webhook_url', labelKey: 'ui.url', type: 'input', placeholder: 'https://n8n.example/webhook/...' },
  ],
  hubspot: [
    {
      key: 'action', labelKey: 'ui.field_hubspot_action', type: 'select',
      options: [
        { value: 'sync_call', label: 'Sync call' },
        { value: 'create_contact', label: 'Create/update contact' },
        { value: 'create_company', label: 'Create/update company' },
        { value: 'create_deal', label: 'Create/update deal' },
        { value: 'create_ticket', label: 'Create ticket' },
        { value: 'create_lead', label: 'Create lead' },
        { value: 'create_note', label: 'Create note' },
        { value: 'create_task', label: 'Create task' },
        { value: 'log_call', label: 'Log call engagement' },
        { value: 'timeline_event', label: 'Timeline event' },
        { value: 'app_event', label: 'App event' },
        { value: 'associate_records', label: 'Associate records' },
      ],
    },
    { key: 'object_type', labelKey: 'hubspot.object_type', type: 'input', placeholder: 'contacts' },
    { key: 'properties_json', labelKey: 'ui.field_properties_json', type: 'textarea', placeholder: '{"phone":"{{from_number}}"}' },
  ],
  knowledge: [
    { key: 'query', labelKey: 'ui.field_query', type: 'textarea', placeholder: 'What information to look up? Use {{variable}} for dynamic values.' },
    { key: 'topK', labelKey: 'ui.field_top_k', type: 'input', placeholder: '5' },
    {
      key: 'retrievalType', labelKey: 'ui.field_retrieval_type', type: 'select',
      options: [
        { value: 'semantic', labelKey: 'ui.option_semantic' },
        { value: 'summary', labelKey: 'ui.option_summary' },
      ],
    },
    {
      key: 'resourceType', labelKey: 'ui.field_filter_by_type', type: 'select',
      options: [
        { value: '', labelKey: 'ui.option_all_types' },
        { value: 'pdf', label: 'PDF' },
        { value: 'image', labelKey: 'ui.option_image' },
        { value: 'csv', label: 'CSV' },
        { value: 'text', labelKey: 'ui.option_text' },
      ],
    },
    { key: 'systemPrompt', labelKey: 'ui.field_system_prompt_optional', type: 'textarea', placeholder: 'You are a helpful assistant. Use the context below to answer...' },
  ],
  hangup: [],
  voice_agent: [
    { key: 'welcome_greeting', labelKey: 'ui.field_welcome_greeting', type: 'textarea', placeholder: 'Hello! How can I help you today?' },
    { key: 'system_prompt', labelKey: 'ui.field_system_prompt', type: 'textarea', placeholder: 'You are a helpful voice assistant.' },
    { key: 'voice', labelKey: 'ui.field_voice', type: 'input', placeholder: 'ElevenLabs voice id' },
    {
      key: 'tts_provider', labelKey: 'ui.field_tts_provider', type: 'select',
      options: [
        { value: 'ElevenLabs', label: 'ElevenLabs' },
        { value: 'Google', label: 'Google' },
        { value: 'Amazon', label: 'Amazon' },
      ],
    },
    { key: 'intelligence_service', labelKey: 'ui.field_intelligence_service', type: 'input', placeholder: 'Optional Conversational Intelligence SID' },
  ],
};

const fieldClass = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/10 ${
    error ? 'border-red-300' : 'border-slate-200'
  }`;

export default function PropertiesPanel({ node, onUpdate, nodes, validationErrors }) {
  const { t } = useTranslation();
  const [localData, setLocalData] = useState({});
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    if (node) {
      setLocalData({ ...node.data });
      setActiveTab('config');
    }
  }, [node?.id]);

  const handleChange = useCallback((key, value) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur = useCallback(() => {
    if (node && localData) {
      onUpdate(node.id, localData);
    }
  }, [node, localData, onUpdate]);

  if (!node) {
    return (
      <div className="flex w-80 shrink-0 flex-col items-center justify-center border-l border-slate-200/80 bg-slate-50/50 p-10 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <Settings2 className="size-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">{t('ui.select_node')}</p>
        <p className="mt-1.5 text-xs text-slate-400">{t('ui.click_to_edit')}</p>
      </div>
    );
  }

  const fields = FIELDS[node.type] || [];
  const nodeErrors = validationErrors?.[node.id] || [];
  const hasAdvanced = fields.some((f) => f.section === 'advanced');

  const getFieldError = (fieldKey) => {
    return nodeErrors.find((e) => e.field === fieldKey)?.message;
  };

  const translateOption = (opt) => (opt.labelKey ? t(opt.labelKey) : opt.label);

  return (
    <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-slate-200/80 bg-white">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-semibold capitalize text-slate-900">{node.type}</p>
          {nodeErrors.length > 0 && (
            <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">ID: {node.id}</p>

        {nodeErrors.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5">
            {nodeErrors.map((e, i) => (
              <p key={e.field || i} className="text-[11px] leading-relaxed text-red-600">
                {e.message}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors ${
            activeTab === 'config'
              ? 'border-b-2 border-cyan-500 text-cyan-700'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings2 className="size-3.5" />
          {t('ui.config') || 'Config'}
        </button>
        {hasAdvanced && (
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors ${
              activeTab === 'advanced'
                ? 'border-b-2 border-cyan-500 text-cyan-700'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="size-3.5" />
            {t('ui.advanced') || 'Advanced'}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="space-y-4">
          {fields.filter((field) => {
            if (activeTab === 'config' && field.section === 'advanced') return false;
            if (activeTab === 'advanced' && field.section !== 'advanced') return false;
            if (field.key === 'bearer_token') return localData.auth_type === 'bearer';
            if (field.key === 'basic_username' || field.key === 'basic_password') return localData.auth_type === 'basic';
            return true;
          }).map((field) => {
            const error = getFieldError(field.key);
            const fieldLabel = field.labelKey ? t(field.labelKey) : field.label;

            if (field.type === 'branches') {
              return (
                <div key={field.key}>
                  <BranchesEditor
                    branches={localData.branches || []}
                    nodes={nodes}
                    onChange={(b) => {
                      handleChange('branches', b);
                      setTimeout(handleBlur, 0);
                    }}
                  />
                  {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
                </div>
              );
            }

            if (field.type === 'headers') {
              return (
                <div key={field.key}>
                  <HeadersEditor
                    headers={localData.headers || []}
                    onChange={(h) => {
                      handleChange('headers', h);
                      setTimeout(handleBlur, 0);
                    }}
                  />
                  {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
                </div>
              );
            }

            if (field.type === 'select') {
              return (
                <div key={field.key}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">{fieldLabel}</label>
                  <select
                    value={localData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={handleBlur}
                    className={fieldClass(error)}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{translateOption(opt)}</option>
                    ))}
                  </select>
                  {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.key}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">{fieldLabel}</label>
                  <textarea
                    value={localData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={handleBlur}
                    rows={3}
                    placeholder={field.placeholder}
                    className={fieldClass(error)}
                  />
                  {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">{fieldLabel}</label>
                <input
                  value={localData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  className={fieldClass(error)}
                />
                {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
              </div>
            );
          })}
          {fields.filter((f) => activeTab === 'config' && !f.section).length === 0 && activeTab === 'config' && (
            <p className="py-6 text-center text-xs text-slate-400">{t('ui.no_config_fields') || 'No configuration fields'}</p>
          )}
          {hasAdvanced && activeTab === 'advanced' && fields.filter((f) => f.section === 'advanced').length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">{t('ui.no_advanced_fields') || 'No advanced options'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function HeadersEditor({ headers, onChange }) {
  const { t } = useTranslation();

  const addHeader = () => {
    onChange([...headers, { name: '', value: '' }]);
  };

  const removeHeader = (i) => {
    onChange(headers.filter((_, idx) => idx !== i));
  };

  const updateHeader = (i, field, value) => {
    const updated = headers.map((h, idx) => (idx === i ? { ...h, [field]: value } : h));
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600">{t('ui.field_headers')}</label>
        <button type="button" onClick={addHeader} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {headers.map((h, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={h.name || ''}
              onChange={(e) => updateHeader(i, 'name', e.target.value)}
              placeholder={t('ui.field_name')}
              className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-700 focus:border-cyan-400 focus:outline-hidden"
            />
            <input
              value={h.value || ''}
              onChange={(e) => updateHeader(i, 'value', e.target.value)}
              placeholder={t('ui.field_value')}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-700 focus:border-cyan-400 focus:outline-hidden"
            />
            <button type="button" onClick={() => removeHeader(i)} className="shrink-0 p-0.5 text-red-400 transition-colors hover:text-red-500">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchesEditor({ branches, nodes, onChange }) {
  const { t } = useTranslation();

  const addBranch = () => {
    onChange([...branches, { label: `${t('ui.field_branch')} ${branches.length + 1}`, expression: '', next: null }]);
  };

  const removeBranch = (i) => {
    onChange(branches.filter((_, idx) => idx !== i));
  };

  const updateBranch = (i, field, value) => {
    const updated = branches.map((b, idx) => (idx === i ? { ...b, [field]: value } : b));
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600">{t('ui.field_branches')}</label>
        <button type="button" onClick={addBranch} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 transition-colors hover:bg-cyan-100">
          + {t('ui.field_add')}
        </button>
      </div>
      <div className="space-y-2.5">
        {branches.map((b, i) => (
          <div key={`${b.label || 'branch'}-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <input
                value={b.label || ''}
                onChange={(e) => updateBranch(i, 'label', e.target.value)}
                placeholder={t('ui.field_label')}
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:border-cyan-400 focus:outline-hidden"
              />
              <button type="button" onClick={() => removeBranch(i)} className="text-[11px] text-red-400 transition-colors hover:text-red-500">&times;</button>
            </div>
            <input
              value={b.expression || ''}
              onChange={(e) => updateBranch(i, 'expression', e.target.value)}
              placeholder="e.g. input == '1'"
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
