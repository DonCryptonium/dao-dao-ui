import ReactMarkdown from 'react-markdown'

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown className="prose prose-sm dark:prose-invert">
      {markdown}
    </ReactMarkdown>
  )
}
