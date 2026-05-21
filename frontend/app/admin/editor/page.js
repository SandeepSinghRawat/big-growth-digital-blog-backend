import { Suspense } from 'react';
import EditorClient from './EditorClient.js';

export default function EditorPage({ searchParams }) {
  return (
    <Suspense fallback={<main className="page-shell"><p className="text-slate-600">Loading editor…</p></main>}>
      <EditorClient searchParams={searchParams} />
    </Suspense>
  );
}
