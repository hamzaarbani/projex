import CommentSection from './CommentSection';
import AttachmentUpload from './AttachmentUpload';

// Inside the modal body (when task is loaded):
<div className="space-y-4">
  {/* ... task fields ... */}
  <CommentSection taskId={task._id} />
  <AttachmentUpload taskId={task._id} />
</div>