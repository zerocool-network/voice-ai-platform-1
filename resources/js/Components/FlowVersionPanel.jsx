import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { RotateCcw, Eye } from 'lucide-react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Alert, AlertTitle, AlertDescription, AlertActions, AlertBody } from '@/Components/catalyst/alert';

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function FlowVersionPanel({ flowId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [restoreVersion, setRestoreVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = useCallback(async () => {
    try {
      const { data } = await axios.get(`/flows/${flowId}/versions`);
      setVersions(data);
    } catch {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = () => {
    if (!restoreVersion) return;
    setRestoring(true);
    router.post(`/flows/${flowId}/versions/${restoreVersion.id}/restore`, {}, {
      onSuccess: () => {
        toast.success(`Restored to version ${restoreVersion.version}`);
        setRestoreVersion(null);
        setRestoring(false);
      },
      onError: () => {
        toast.error('Failed to restore version');
        setRestoring(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {versions.length === 0 ? (
        <Text className="py-8 text-center text-sm text-zinc-400">No version history yet.</Text>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    v{version.version}
                  </span>
                  {version.change_description && (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {version.change_description}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                  {version.user?.name && <span>{version.user.name}</span>}
                  <span>{timeAgo(version.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button outline onClick={() => setPreviewVersion(version)}>
                  <Eye className="size-3" />
                  Preview
                </Button>
                <Button outline onClick={() => setRestoreVersion(version)}>
                  <RotateCcw className="size-3" />
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Alert open={previewVersion !== null} onClose={() => setPreviewVersion(null)}>
        <AlertTitle>Version {previewVersion?.version} Preview</AlertTitle>
        <AlertDescription>
          {previewVersion?.change_description || 'No description'}
        </AlertDescription>
        <AlertBody>
          <pre className="max-h-96 overflow-y-auto rounded bg-zinc-50 p-3 text-xs dark:bg-zinc-800">
            {JSON.stringify(previewVersion?.config, null, 2)}
          </pre>
        </AlertBody>
        <AlertActions>
          <Button plain onClick={() => setPreviewVersion(null)}>Close</Button>
        </AlertActions>
      </Alert>

      <Alert open={restoreVersion !== null} onClose={() => setRestoreVersion(null)}>
        <AlertTitle>Restore Version {restoreVersion?.version}</AlertTitle>
        <AlertDescription>
          This will create a new version with the configuration from version {restoreVersion?.version}.
          Your current configuration will be saved as a snapshot.
        </AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setRestoreVersion(null)}>Cancel</Button>
          <Button onClick={handleRestore} disabled={restoring}>
            {restoring ? 'Restoring...' : 'Restore'}
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
