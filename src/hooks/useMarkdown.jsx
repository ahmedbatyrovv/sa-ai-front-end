import ReactMarkdown from "react-markdown";
import { useMemo } from "react";
import remarkGfm from "remark-gfm";

export const useMarkdown = (text) => {
  return useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="markdown-p">{children}</p>,
          code: ({ children, className }) => (
            <code className={`markdown-code ${className || ""}`}>
              {children}
            </code>
          ),
          pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-li">{children}</li>,
          strong: ({ children }) => (
            <strong className="markdown-strong">{children}</strong>
          ),
          em: ({ children }) => <em className="markdown-em">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="markdown-a"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {text || ""}
      </ReactMarkdown>
    ),
    [text]
  );
};
