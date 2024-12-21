import React, { memo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';  // Add this import
import 'highlight.js/styles/github-dark.css';

const CodeBlock = ({
  className,
  children
}: {
  className?: string,
  children: React.ReactNode
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  const handleCopy = () => {
    const code = React.Children.toArray(children)
      .map(child => {
        if (typeof child === 'string') return child;
        if (React.isValidElement(child)) return child.props?.children || '';
        return '';
      }).join('');

    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      console.error("No valid code to copy.");
    }
  };

  return (
    <div className="w-auto max-w-2xl overflow-x-auto my-2">
      <div className="w-full bg-zinc-800 px-4 py-2 flex justify-between items-center rounded-t-lg">
        <span className="text-sm text-gray-300 font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="bg-zinc-700 text-white px-3 py-1 rounded text-xs hover:bg-zinc-600 transition-colors"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        className={`
          ${className} text-sm min-size-full overflow-x-auto bg-zinc-900 p-4 rounded-b-lg text-wrap
        `}
      >
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
};

const MarkdownImage = ({
  src,
  alt,
  title
}: {
  src?: string,
  alt?: string,
  title?: string
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-image.png';
  };

  const processedAlt = alt?.replace(/^.*\//, '').replace(/\.[^.]+$/, '') || 'Markdown Image';

  return (
    <div className="w-full max-w-full md:max-w-[80%] mx-auto my-4">
      <img
        src={src || '/placeholder-image.png'}
        alt={processedAlt}
        onError={handleImageError}
        className="
          w-full 
          rounded-lg 
          shadow-md 
          object-cover 
          max-h-[500px]
        "
      />
      {(title || processedAlt) && (
        <p className="
          text-center 
          text-sm 
          text-gray-600 
          dark:text-gray-300 
          mt-2
        ">
          {title || processedAlt}
        </p>
      )}
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components: Partial<Components> = {
    code: (props) => {
      const isInline = props.node?.type === 'element' &&
        props.node.tagName === 'code' &&
        props.node.children[0]?.type === 'text';

      const match = /language-(\w+)/.exec(props.className || '');

      return isInline || !match ? (
        <code
          className={`${props.className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md max-w-2xl w-auto overflow-x-auto`}
          {...props}
        >
          {props.children}
        </code>
      ) : (
        <CodeBlock className={props.className}>
          {props.children}
        </CodeBlock>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-disc list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      return (
        <span className="font-semibold overflow-auto" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }) => {
      return (
        <a
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ node, children, ...props }) => {
      return (
        <h1
          className="
            text-responsive 
            font-bold 
            mt-6 
            mb-4 
            text-zinc-900 
            dark:text-zinc-100 
            leading-tight
          "
          {...props}
        >
          {children}
        </h1>
      );
    },
    p: ({ node, children, ...props }) => {
      return (
        <p
          className="my-2 text-zinc-700 dark:text-zinc-300 leading-relaxed"
          {...props}
        >
          {children}
        </p>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2
          className="text-responsive font-semibold mt-5 mb-3 text-zinc-900 dark:text-zinc-100 leading-tight"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
    img: ({ node, ...props }) => {
      return (
        <MarkdownImage
          src={props.src}
          alt={props.alt}
          title={props.title}
        />
      );
    },

    table: ({ children, ...props }) => (
      <div className="my-4 w-full overflow-hidden">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-x-auto table-scrollbar">
          <table
            className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 overflow-hidden"
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    ),

    thead: ({ children, ...props }) => (
      <thead
        className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 backdrop-blur-sm backdrop-filter"
        {...props}
      >
        {children}
      </thead>
    ),

    tbody: ({ children, ...props }) => (
      <tbody
        className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900/50"
        {...props}
      >
        {children}
      </tbody>
    ),

    tr: ({ children, ...props }) => (
      <tr
        className="
          hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
          transition-colors duration-200
          even:bg-zinc-50/50 dark:even:bg-zinc-800/25
        "
        {...props}
      >
        {children}
      </tr>
    ),

    th: ({ children, ...props }) => (
      <th
        className="
          px-6 py-3 text-left text-xs font-medium 
          text-zinc-500 dark:text-zinc-400 
          uppercase tracking-wider
          whitespace-nowrap
        "
        {...props}
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }) => (
      <td
        className="
          px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300
          whitespace-nowrap
        "
        {...props}
      >
        {children}
      </td>
    ),
  };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      remarkPlugins={[remarkGfm]}  // Add this line
      components={components}
      className="w-full max-w-2xl break-words text-wrap gap-1"
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
