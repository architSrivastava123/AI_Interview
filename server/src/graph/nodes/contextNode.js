/**
 * contextNode.js
 * LangGraph Node: Loads candidate resume context and technical knowledge base context via RAG.
 */

import { retrieveResumeContext } from '../../rag/retriever/resumeRetriever.js';
import { retrieveTechnicalKnowledge } from '../../rag/retriever/knowledgeRetriever.js';

export async function contextNode(state) {
  const { resumeId, clerkUserId, targetRole, interviewType } = state;

  let resumeContextText = '';
  if (resumeId && clerkUserId) {
    const resumeData = await retrieveResumeContext(resumeId, clerkUserId, targetRole, 2);
    resumeContextText = resumeData.resumeContextText;
  }

  const techData = await retrieveTechnicalKnowledge(targetRole, targetRole, 2);

  return {
    resumeContext: resumeContextText,
    technicalContext: techData.contextText,
  };
}
