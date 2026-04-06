import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  IngestSourceSummary,
  KnowledgeDocument,
  KnowledgeIngestStatusResponse
} from '../../shared/contracts.js';

interface KnowledgeSourceFile {
  sourceId: string;
  title: string;
  documents: KnowledgeDocument[];
}

let cachedDocuments: KnowledgeDocument[] = [];
let sourceSummaries: IngestSourceSummary[] = [];
let lastReloadedAt = new Date(0).toISOString();

export async function loadKnowledgeSources() {
  const sourceDirectory = join(process.cwd(), 'knowledge-sources');
  const files = (await readdir(sourceDirectory)).filter((file) => file.endsWith('.json'));
  const sources = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(join(sourceDirectory, file), 'utf-8');
      return JSON.parse(content) as KnowledgeSourceFile;
    })
  );

  cachedDocuments = sources.flatMap((source) => source.documents);
  lastReloadedAt = new Date().toISOString();
  sourceSummaries = sources.map((source) => ({
    sourceId: source.sourceId,
    title: source.title,
    documentCount: source.documents.length,
    lastLoadedAt: lastReloadedAt
  }));

  return getKnowledgeIngestStatus();
}

export function getKnowledgeDocuments() {
  return cachedDocuments;
}

export function getKnowledgeIngestStatus(): KnowledgeIngestStatusResponse {
  return {
    totalDocuments: cachedDocuments.length,
    sources: sourceSummaries,
    lastReloadedAt
  };
}
