import { useAppStore } from '../../stores/useAppStore';
import MarkdownEditor from '../editor/MarkdownEditor';
import MarkdownPreview from '../preview/MarkdownPreview';
import SplitPane from '../shared/SplitPane';
import EmptyState from '../shared/EmptyState';
import SearchBar from '../search/SearchBar';
import FileTabsBar from './FileTabsBar';

export default function MainContent() {
  const viewMode = useAppStore((s) => s.viewMode);
  const currentFilePath = useAppStore((s) => s.currentFilePath);

  if (!currentFilePath) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <FileTabsBar />
        <EmptyState />
      </div>
    );
  }

  if (viewMode === 'edit') {
    return (
      <div className="flex-1 overflow-hidden relative flex flex-col min-w-0">
        <FileTabsBar />
        <div className="flex-1 overflow-hidden relative">
          <SearchBar />
          <MarkdownEditor />
        </div>
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <div className="flex-1 overflow-hidden relative flex flex-col min-w-0">
        <FileTabsBar />
        <div className="flex-1 overflow-hidden relative">
          <SearchBar />
          <MarkdownPreview />
        </div>
      </div>
    );
  }

  // split mode
  return (
    <div className="flex-1 overflow-hidden relative flex flex-col min-w-0">
      <FileTabsBar />
      <div className="flex-1 overflow-hidden relative">
        <SearchBar />
        <SplitPane left={<MarkdownEditor />} right={<MarkdownPreview />} />
      </div>
    </div>
  );
}
