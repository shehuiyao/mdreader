import { useAppStore } from '../../stores/useAppStore';
import MarkdownEditor from '../editor/MarkdownEditor';
import MarkdownPreview from '../preview/MarkdownPreview';
import SplitPane from '../shared/SplitPane';
import EmptyState from '../shared/EmptyState';

export default function MainContent() {
  const viewMode = useAppStore((s) => s.viewMode);
  const currentFilePath = useAppStore((s) => s.currentFilePath);

  if (!currentFilePath) {
    return (
      <div className="flex-1">
        <EmptyState />
      </div>
    );
  }

  if (viewMode === 'edit') {
    return (
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor />
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <div className="flex-1 overflow-hidden">
        <MarkdownPreview />
      </div>
    );
  }

  // split mode
  return (
    <div className="flex-1 overflow-hidden">
      <SplitPane left={<MarkdownEditor />} right={<MarkdownPreview />} />
    </div>
  );
}
