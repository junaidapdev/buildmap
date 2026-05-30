import ReactMarkdown from 'react-markdown';

/**
 * View-mode renderer for one spec section's markdown body. Uses the project's canonical, XSS-safe
 * markdown renderer (react-markdown with NO rehype-raw), so any raw HTML in the stored markdown is
 * escaped rather than rendered. The `prose` classes come from @tailwindcss/typography.
 */
export function FeatureSpecSection({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
