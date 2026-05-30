import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import {
  chunkFolderPath,
  chunkPromptFilename,
  CONTEXT_ZIP_PATHS,
  issueZipFilename,
  LEARNINGS_FILENAMES,
  slugForFilenameSafe,
} from '@shared/export/filenames.ts';
import { renderReadme } from '@shared/export/readme-template.ts';
import { renderIssueFile, renderLearningsFile } from '@shared/export/zip-content.ts';
import { env } from '@shared/env.ts';
import { corsHeaders, handleCorsPreflight } from '@shared/http/cors.ts';
import { fail } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { ExportProjectZipInputSchema } from '@shared/schemas/export.ts';

const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024;

const CONTEXT_FILE_TYPES = [
  'project_overview',
  'code_standards',
  'ai_workflow_rules',
  'ui_context',
  'agents_md',
  'claude_md',
  'progress_tracker',
] as const;

const LEARNING_TYPES = ['lesson', 'decision', 'gotcha', 'open_question'] as const;

type LearningType = (typeof LEARNING_TYPES)[number];

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) {
    return preflight;
  }

  if (req.method !== 'POST') {
    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      req,
    );
  }

  try {
    const { jwt, userId } = await requireAuth(req);

    const body = await req.json().catch(() => null);
    const parsed = ExportProjectZipInputSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const projectId = parsed.data.projectId;

    const [
      projectRes,
      documentsRes,
      chunksRes,
      specsRes,
      issuesRes,
      learningsRes,
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, status, created_at, updated_at')
        .eq('id', projectId)
        .single(),
      supabase.from('project_documents').select('type, content').eq('project_id', projectId),
      supabase
        .from('feature_chunks')
        .select('id, position, ref, title')
        .eq('project_id', projectId)
        .order('position', { ascending: true }),
      supabase.from('feature_specs').select('chunk_id, content').eq('project_id', projectId),
      supabase
        .from('project_issues')
        .select('id, title, description, corrective_prompt, status, created_at')
        .eq('project_id', projectId),
      supabase
        .from('project_learnings')
        .select('id, type, title, content, source_label, created_at')
        .eq('project_id', projectId),
    ]);

    if (projectRes.error || !projectRes.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const project = projectRes.data;
    const documents = documentsRes.data ?? [];
    const chunks = chunksRes.data ?? [];
    const specsByChunkId = new Map((specsRes.data ?? []).map((s) => [s.chunk_id, s.content]));

    const chunkIds = chunks.map((c) => c.id);
    const promptsRes = chunkIds.length > 0
      ? await supabase
        .from('coding_agent_prompts')
        .select('chunk_id, target_agent, content')
        .in('chunk_id', chunkIds)
      : {
        data: [] as Array<{ chunk_id: string; target_agent: string; content: string }>,
        error: null,
      };

    if (promptsRes.error) {
      logger.error('export_prompts_fetch_failed', { userId, projectId });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const promptsByChunkId = new Map<string, Array<{ target_agent: string; content: string }>>();
    for (const p of promptsRes.data ?? []) {
      const list = promptsByChunkId.get(p.chunk_id) ?? [];
      list.push({ target_agent: p.target_agent, content: p.content });
      promptsByChunkId.set(p.chunk_id, list);
    }

    const issues = issuesRes.data ?? [];
    const learnings = learningsRes.data ?? [];

    const zip = new JSZip();

    zip.file(
      'README.md',
      renderReadme({
        projectName: project.name,
        projectDescription: project.description,
        projectType: project.project_type,
        exportedAt: new Date().toISOString(),
        counts: {
          contextFiles: documents.filter((d) =>
            (CONTEXT_FILE_TYPES as readonly string[]).includes(d.type)
          ).length,
          chunks: chunks.length,
          featureSpecs: specsRes.data?.length ?? 0,
          agentPrompts: promptsRes.data?.length ?? 0,
          issues: issues.length,
          learnings: learnings.length,
        },
      }),
    );

    for (const d of documents) {
      if (d.type === 'agents_md') {
        zip.file('AGENTS.md', d.content);
      }
      if (d.type === 'claude_md') {
        zip.file('CLAUDE.md', d.content);
      }
    }

    for (const d of documents) {
      const zipPath = CONTEXT_ZIP_PATHS[d.type];
      if (zipPath) {
        zip.file(zipPath, d.content);
      }
    }

    for (const d of documents) {
      if (d.type === 'project_brief') {
        zip.file('docs/brief.md', d.content);
      }
      if (d.type === 'prd') {
        zip.file('docs/prd.md', d.content);
      }
      if (d.type === 'architecture') {
        zip.file('docs/architecture.md', d.content);
      }
    }

    for (const c of chunks) {
      const folder = chunkFolderPath(c.position, c.ref, c.title);
      const spec = specsByChunkId.get(c.id);
      if (spec) {
        zip.file(`${folder}/feature-spec.md`, spec);
      }
      const prompts = promptsByChunkId.get(c.id) ?? [];
      for (const p of prompts) {
        if (
          p.target_agent === 'claude_code' || p.target_agent === 'cursor' ||
          p.target_agent === 'generic'
        ) {
          zip.file(
            `${folder}/${chunkPromptFilename(p.target_agent)}`,
            p.content,
          );
        }
      }
    }

    for (const issue of issues) {
      zip.file(issueZipFilename(issue.id, issue.title), renderIssueFile(issue));
    }

    const learningsByType: Record<LearningType, typeof learnings> = {
      lesson: [],
      decision: [],
      gotcha: [],
      open_question: [],
    };
    for (const l of learnings) {
      const bucket = learningsByType[l.type as LearningType];
      if (bucket) {
        bucket.push(l);
      }
    }
    for (const type of LEARNING_TYPES) {
      const items = learningsByType[type];
      if (items.length === 0) {
        continue;
      }
      zip.file(LEARNINGS_FILENAMES[type], renderLearningsFile(items, type));
    }

    const blob = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    if (blob.byteLength > MAX_ZIP_SIZE_BYTES) {
      logger.warn('export_too_large', { userId, projectId, sizeBytes: blob.byteLength });
      return fail(
        ERROR_CODES.EXPORT_TOO_LARGE,
        ERROR_MESSAGES.EXPORT_TOO_LARGE,
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        req,
      );
    }

    logger.info('project_exported', {
      userId,
      projectId,
      sizeBytes: blob.byteLength,
      counts: {
        documents: documents.length,
        chunks: chunks.length,
        issues: issues.length,
        learnings: learnings.length,
      },
    });

    const filename = `${slugForFilenameSafe(project.name)}-specforge-export.zip`;
    const headers = corsHeaders(req);
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', String(blob.byteLength));

    return new Response(new Uint8Array(blob), { status: HTTP_STATUS.OK, headers });
  } catch (err) {
    if (err instanceof AuthError) {
      return fail(
        ERROR_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        req,
      );
    }

    logger.error('export_unhandled_error', {
      route: 'export-project-zip',
      message: err instanceof Error ? err.message : 'unknown',
    });
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
});
