import { useState } from "react";

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export default function StrategyOutput({ markdown, onRegenerate, onBack, isLoading }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-5 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer font-barlow"
          aria-label="Edit inputs"
        >
          <ArrowLeftIcon />
          Edit Inputs
        </button>
        <div className="flex-1" />
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer font-barlow"
        >
          {copied ? <CheckIcon /> : <ClipboardIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 rounded-lg text-orange-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-barlow"
        >
          <RefreshIcon />
          Regenerate
        </button>
      </div>

      {/* Markdown content */}
      <div className="font-barlow">
        <MarkdownRenderer content={markdown} />
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }) {
  const html = parseMarkdown(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function parseMarkdown(md) {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Tables
  html = html.replace(
    /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_, header, _separator, body) => {
      const ths = header
        .split("|")
        .filter((c) => c.trim())
        .map(
          (c) =>
            `<th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-800/80 font-barlow-condensed">${c.trim()}</th>`
        )
        .join("");
      const rows = body
        .trim()
        .split("\n")
        .map((row) => {
          const tds = row
            .split("|")
            .filter((c) => c.trim())
            .map(
              (c) =>
                `<td class="px-4 py-3 text-sm text-gray-300 border-t border-gray-700/60 font-barlow">${c.trim()}</td>`
            )
            .join("");
          return `<tr class="hover:bg-gray-800/40 transition-colors duration-150">${tds}</tr>`;
        })
        .join("");
      return `<div class="overflow-x-auto my-5 rounded-xl border border-gray-700/60"><table class="w-full"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
  );

  // Headers
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="font-barlow-condensed font-bold text-orange-400 text-base uppercase tracking-wider mt-6 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="font-barlow-condensed font-bold text-white text-2xl uppercase tracking-wide mt-8 mb-3 pb-2 border-b border-gray-700/60">$1</h2>'
  );

  // Bold and italic
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-white font-semibold font-barlow">$1</strong>'
  );
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Bullet lists
  html = html.replace(
    /^- (.+)$/gm,
    '<li class="text-gray-300 ml-4 list-disc font-barlow leading-relaxed">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    (match) => `<ul class="my-3 space-y-1.5">${match}</ul>`
  );

  // Numbered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="text-gray-300 ml-4 list-decimal font-barlow leading-relaxed">$1</li>'
  );

  // Paragraphs
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (
        !trimmed ||
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<table")
      ) {
        return trimmed;
      }
      return `<p class="text-gray-300 leading-relaxed my-3 font-barlow">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
