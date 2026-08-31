/**
 * interviewGraph.js
 * Compiles the LangGraph state machine with conditional routing and execution helpers.
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { InterviewState } from './state.js';
import { contextNode } from './nodes/contextNode.js';
import { questionNode } from './nodes/questionNode.js';
import { evaluationNode } from './nodes/evaluationNode.js';
import { adaptiveNode } from './nodes/adaptiveNode.js';
import { reportNode } from './nodes/reportNode.js';

/**
 * Builds and compiles the Interview workflow graph.
 */
export function createInterviewGraph() {
  const workflow = new StateGraph(InterviewState)
    .addNode('context', contextNode)
    .addNode('question', questionNode)
    .addNode('evaluation', evaluationNode)
    .addNode('adaptive', adaptiveNode)
    .addNode('report', reportNode)

    // Edges for setup -> question
    .addEdge(START, 'context')
    .addEdge('context', 'question')
    .addEdge('question', END)

    // Edges for answer -> evaluation -> adaptive -> report/end
    .addEdge('evaluation', 'adaptive')
    .addConditionalEdges('adaptive', (state) => {
      if (state.isComplete) {
        return 'report';
      }
      return END;
    })
    .addEdge('report', END);

  return workflow.compile();
}

export const interviewGraphApp = createInterviewGraph();

/**
 * Runner: Generates the initial interview question with RAG context.
 * @param {Object} initialState
 * @returns {Promise<Object>} Updated state
 */
export async function runStartInterview(initialState) {
  const startWorkflow = new StateGraph(InterviewState)
    .addNode('context', contextNode)
    .addNode('question', questionNode)
    .addEdge(START, 'context')
    .addEdge('context', 'question')
    .addEdge('question', END)
    .compile();

  return startWorkflow.invoke(initialState);
}

/**
 * Runner: Evaluates candidate answer, performs speech analysis, scoring, and adaptive transition.
 * @param {Object} answerState
 * @returns {Promise<Object>} Updated state
 */
export async function runEvaluateAnswer(answerState) {
  const evalWorkflow = new StateGraph(InterviewState)
    .addNode('evaluation', evaluationNode)
    .addNode('adaptive', adaptiveNode)
    .addEdge(START, 'evaluation')
    .addEdge('evaluation', 'adaptive')
    .addEdge('adaptive', END)
    .compile();

  return evalWorkflow.invoke(answerState);
}

/**
 * Runner: Generates the next adaptive question in an active interview session.
 * @param {Object} state
 * @returns {Promise<Object>} Updated state
 */
export async function runNextQuestion(state) {
  const nextWorkflow = new StateGraph(InterviewState)
    .addNode('question', questionNode)
    .addEdge(START, 'question')
    .addEdge('question', END)
    .compile();

  return nextWorkflow.invoke(state);
}

/**
 * Runner: Synthesizes final performance report and recommendations.
 * @param {Object} state
 * @returns {Promise<Object>} Updated state
 */
export async function runCompleteInterview(state) {
  const reportWorkflow = new StateGraph(InterviewState)
    .addNode('report', reportNode)
    .addEdge(START, 'report')
    .addEdge('report', END)
    .compile();

  return reportWorkflow.invoke(state);
}
