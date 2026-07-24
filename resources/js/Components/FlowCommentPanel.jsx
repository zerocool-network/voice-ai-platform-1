import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Textarea } from '@/Components/catalyst/textarea';
import { Avatar } from '@/Components/catalyst/avatar';

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

function CommentItem({ comment, onReply }) {
  return (
    <div className="flex gap-3 py-3">
      <Avatar alt={comment.user?.name || 'Unknown'} className="size-8 shrink-0" initials={comment.user?.name?.charAt(0) || '?'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {comment.user?.name || 'Unknown'}
          </span>
          <span className="text-xs text-zinc-400">{timeAgo(comment.created_at)}</span>
        </div>
        <Text className="mt-1 text-sm">{comment.body}</Text>
        <div className="mt-1">
          <button
            type="button"
            onClick={() => onReply(comment.id)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Reply
          </button>
        </div>
        {comment.replies?.length > 0 && (
          <div className="mt-2 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowCommentPanel({ flowId }) {
  const { auth } = usePage().props;
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await axios.get(`/flows/${flowId}/comments`);
      setComments(data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      await axios.post(`/flows/${flowId}/comments`, {
        body: body.trim(),
        parent_id: replyTo,
      });
      setBody('');
      setReplyTo(null);
      toast.success('Comment added');
      fetchComments();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
  };

  const cancelReply = () => {
    setReplyTo(null);
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
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Replying to a comment</span>
              <button type="button" onClick={cancelReply} className="text-zinc-400 hover:text-zinc-600">
                Cancel
              </button>
            </div>
          )}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={posting || !body.trim()}>
              {posting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {comments.length === 0 ? (
          <Text className="py-8 text-center text-sm text-zinc-400">No comments yet.</Text>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
