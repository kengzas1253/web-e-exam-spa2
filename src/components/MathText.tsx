import { InlineMath } from "react-katex";

type Part = {
  text: string;
  math: boolean;
};

export function MathText({ text }: { text: string }) {
  const parts = parseMath(text);
  return (
    <>
      {parts.map((part, index) =>
        part.math ? <InlineMath key={index} math={part.text} /> : <span key={index}>{part.text}</span>,
      )}
    </>
  );
}

function parseMath(text: string): Part[] {
  const parts: Part[] = [];
  const regex = /\$(.+?)\$|\\\((.+?)\\\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), math: false });
    parts.push({ text: match[1] ?? match[2] ?? "", math: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), math: false });
  return parts.length ? parts : [{ text, math: false }];
}
