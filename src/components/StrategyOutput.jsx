import { useState } from "react";

export default function StrategyOutput({ markdown, onRegenerate, onBack, isLoading }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Edit Inputs
        </button>
        <div className="flex-1" />
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors"
        >
          {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
        </button>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-orange-400 transition-colors disabled:opacity-50"
        >
          🔄 Regenerate
        </button>
      </div>

      <div className="prose-custom">
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
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Tables: find lines that contain pipes
  html = html.replace(
    /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_, header, _separator, body) => {
      const ths = header
        .split("|")
        .filter((c) => c.trim())
        .map((c) => `<th class="px-4 py-2 text-left text-sm font-semibold text-slate-200 bg-slate-700/50">${c.trim()}</th>`)
        .join("");
      const rows = body
        .trim()
        .split("\n")
        .map((row) => {
          const tds = row
            .split("|")
            .filter((c) => c.trim())
            .map((c) => `<td class="px-4 py-2 text-sm text-slate-300 border-t border-slate-700">${c.trim()}</td>`)
            .join("");
          return `<tr class="hover:bg-slate-700/20">${tds}</tr>`;
        })
        .join("");
      return `<div class="overflow-x-auto my-4 rounded-lg border border-slate-700"><table class="w-full"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
  );

  // Headers
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-base font-semibold text-orange-400 mt-6 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-bold text-white mt-8 mb-3 pb-2 border-b border-slate-700">$1</h2>'
  );

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bullet lists
  html = html.replace(
    /^- (.+)$/gm,
    '<li class="text-slate-300 ml-4 list-disc">$1</li>'
  );
  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`
  );

  // Numbered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="text-slate-300 ml-4 list-decimal">$1</li>'
  );

  // Paragraphs: wrap remaining text blocks
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
      return `<p class="text-slate-300 leading-relaxed my-2">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
