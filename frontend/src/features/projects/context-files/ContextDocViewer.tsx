import ReactMarkdown from 'react-markdown';

/**
 * Renders a context doc's markdown. react-markdown is configured with NO rehype-raw and no HTML
 * plugins, so any raw HTML embedded in the (untrusted) stored markdown is escaped rather than
 * rendered — this is the project's canonical, XSS-safe markdown renderer. The `prose` classes come
 * from @tailwindcss/typography.
 */
export function ContextDocViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
