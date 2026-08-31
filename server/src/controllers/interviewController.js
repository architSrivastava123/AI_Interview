/**
 * interviewController.js
 * Express controller for managing interviews, answers, adaptive progression, and completion.
 */

import { Interview } from '../models/Interview.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Report } from '../models/Report.js';
import { Recommendation } from '../models/Recommendation.js';
import {
  runStartInterview,
  runEvaluateAnswer,
  runNextQuestion,
  runCompleteInterview,
} from '../graph/interviewGraph.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * POST /api/interviews
 * Creates a new interview session.
 */
export async function createInterview(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const {
      targetRole = 'Frontend Engineer',
      jobDescription = '',
      experience = '2-4 years',
      interviewType = 'technical',
      totalQuestions = 5,
      resumeId = null,
      difficulty = 'Medium',
    } = req.body;

    const interview = await Interview.create({
      clerkUserId,
      targetRole,
      jobDescription,
      experience,
      interviewType,
      totalQuestions: Math.min(10, Math.max(1, Number(totalQuestions) || 5)),
      resumeId: resumeId || null,
      difficulty,
      status: 'setup',
    });

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview session created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/interviews
 * Lists all interviews belonging to the authenticated Clerk user.
 */
export async function listInterviews(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interviews = await Interview.find({ clerkUserId })
      .sort({ createdAt: -1 })
      .populate('resumeId', 'filename')
      .lean();

    res.status(200).json({
      success: true,
      data: interviews,
      count: interviews.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/interviews/:id
 * Fetches single interview details, questions, and answers.
 */
export async function getInterviewById(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interview = await Interview.findOne({ _id: req.params.id, clerkUserId })
      .populate('resumeId', 'filename')
      .lean();

    if (!interview) {
      throw new AppError('Interview not found or unauthorized.', 404, 'NOT_FOUND');
    }

    const questions = await Question.find({ interviewId: interview._id, clerkUserId })
      .sort({ order: 1 })
      .lean();

    const answers = await Answer.find({ interviewId: interview._id, clerkUserId })
      .lean();

    const report = await Report.findOne({ interviewId: interview._id, clerkUserId }).lean();

    res.status(200).json({
      success: true,
      data: {
        interview,
        questions,
        answers,
        report,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/interviews/:id
 * Deletes interview session and associated records.
 */
export async function deleteInterview(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, clerkUserId });

    if (!interview) {
      throw new AppError('Interview not found or unauthorized.', 404, 'NOT_FOUND');
    }

    await Question.deleteMany({ interviewId: req.params.id, clerkUserId });
    await Answer.deleteMany({ interviewId: req.params.id, clerkUserId });
    await Report.deleteMany({ interviewId: req.params.id, clerkUserId });
    await Recommendation.deleteMany({ interviewId: req.params.id, clerkUserId });

    res.status(200).json({
      success: true,
      message: 'Interview and associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/interviews/:id/start
 * Kicks off the LangGraph interview workflow, loads RAG context, and creates Question 1.
 */
export async function startInterview(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interview = await Interview.findOne({ _id: req.params.id, clerkUserId });

    if (!interview) {
      throw new AppError('Interview not found.', 404, 'NOT_FOUND');
    }

    // Check if Question 1 already exists
    const existingQuestion = await Question.findOne({ interviewId: interview._id, order: 1, clerkUserId });
    if (existingQuestion) {
      interview.status = 'in_progress';
      await interview.save();
      return res.status(200).json({
        success: true,
        data: {
          interview,
          question: existingQuestion,
        },
      });
    }

    const initialState = {
      interviewId: interview._id.toString(),
      clerkUserId,
      targetRole: interview.targetRole,
      experience: interview.experience,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      currentQuestionIndex: 0,
      resumeId: interview.resumeId ? interview.resumeId.toString() : null,
      questions: [],
    };

    const resultState = await runStartInterview(initialState);
    const generatedQ = resultState.currentQuestion;

    const savedQuestion = await Question.create({
      interviewId: interview._id,
      clerkUserId,
      order: 1,
      questionText: generatedQ.questionText,
      category: generatedQ.category,
      topic: generatedQ.topic,
      difficulty: generatedQ.difficulty,
      expectedConcepts: generatedQ.expectedConcepts,
      source: generatedQ.source,
    });

    interview.status = 'in_progress';
    interview.currentQuestionIndex = 1;
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        interview,
        question: savedQuestion,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/interviews/:id/answer
 * Evaluates candidate answer, performs speech analysis & deterministic scoring.
 */
export async function submitAnswer(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const { questionId, answerText = '', durationSeconds = 0 } = req.body;

    const interview = await Interview.findOne({ _id: req.params.id, clerkUserId });
    if (!interview) {
      throw new AppError('Interview not found.', 404, 'NOT_FOUND');
    }

    const question = await Question.findOne({ _id: questionId, interviewId: interview._id, clerkUserId });
    if (!question) {
      throw new AppError('Question not found.', 404, 'NOT_FOUND');
    }

    const answerState = {
      interviewId: interview._id.toString(),
      clerkUserId,
      targetRole: interview.targetRole,
      difficulty: question.difficulty,
      currentQuestionIndex: question.order,
      totalQuestions: interview.totalQuestions,
      currentQuestion: question,
      currentAnswerText: answerText,
      currentDurationSeconds: Number(durationSeconds) || 0,
      evaluations: [],
      sessionScores: [],
    };

    const resultState = await runEvaluateAnswer(answerState);

    // Save or update Answer document
    const answerDoc = await Answer.findOneAndUpdate(
      { interviewId: interview._id, questionId: question._id, clerkUserId },
      {
        questionText: question.questionText,
        answerText,
        speechMetrics: resultState.currentSpeechMetrics,
        evaluation: resultState.currentEvaluation,
        scores: resultState.currentScores,
      },
      { upsert: true, new: true }
    );

    // Update interview difficulty if adaptively adjusted
    if (resultState.difficulty) {
      interview.difficulty = resultState.difficulty;
    }
    interview.durationSeconds = (interview.durationSeconds || 0) + (Number(durationSeconds) || 0);
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        answer: answerDoc,
        evaluation: resultState.currentEvaluation,
        scores: resultState.currentScores,
        speechMetrics: resultState.currentSpeechMetrics,
        nextDifficulty: resultState.difficulty,
        isComplete: resultState.isComplete,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/interviews/:id/next-question
 * Generates the next question adaptively based on state and previous performance.
 */
export async function nextQuestion(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interview = await Interview.findOne({ _id: req.params.id, clerkUserId });

    if (!interview) {
      throw new AppError('Interview not found.', 404, 'NOT_FOUND');
    }

    const existingQuestions = await Question.find({ interviewId: interview._id, clerkUserId }).sort({ order: 1 });
    const nextOrder = existingQuestions.length + 1;

    if (nextOrder > interview.totalQuestions) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'All questions have been generated. Ready to complete interview.',
        isComplete: true,
      });
    }

    const lastAnswer = await Answer.findOne({ interviewId: interview._id, clerkUserId }).sort({ createdAt: -1 });

    const state = {
      interviewId: interview._id.toString(),
      clerkUserId,
      targetRole: interview.targetRole,
      experience: interview.experience,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      currentQuestionIndex: existingQuestions.length,
      resumeId: interview.resumeId ? interview.resumeId.toString() : null,
      questions: existingQuestions,
      currentEvaluation: lastAnswer?.evaluation || null,
      currentScores: lastAnswer?.scores || null,
    };

    const resultState = await runNextQuestion(state);
    const generatedQ = resultState.currentQuestion;

    const savedQuestion = await Question.create({
      interviewId: interview._id,
      clerkUserId,
      order: nextOrder,
      questionText: generatedQ.questionText,
      category: generatedQ.category,
      topic: generatedQ.topic,
      difficulty: generatedQ.difficulty,
      expectedConcepts: generatedQ.expectedConcepts,
      source: generatedQ.source,
    });

    interview.currentQuestionIndex = nextOrder;
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        question: savedQuestion,
        isComplete: false,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/interviews/:id/complete
 * Synthesizes final performance report, generates recommendations, and closes session.
 */
export async function completeInterview(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const interview = await Interview.findOne({ _id: req.params.id, clerkUserId });

    if (!interview) {
      throw new AppError('Interview not found.', 404, 'NOT_FOUND');
    }

    const questions = await Question.find({ interviewId: interview._id, clerkUserId }).sort({ order: 1 }).lean();
    const answers = await Answer.find({ interviewId: interview._id, clerkUserId }).lean();

    const evaluations = answers.map(a => a.evaluation || {});
    const sessionScores = answers.map(a => a.scores || {});

    const state = {
      interviewId: interview._id.toString(),
      clerkUserId,
      targetRole: interview.targetRole,
      questions,
      evaluations,
      sessionScores,
    };

    const resultState = await runCompleteInterview(state);
    const finalReportData = resultState.finalReport;

    // Save or update Report
    const reportDoc = await Report.findOneAndUpdate(
      { interviewId: interview._id, clerkUserId },
      {
        targetRole: interview.targetRole,
        totalQuestions: questions.length,
        overallScore: finalReportData.overallScore,
        technicalScore: finalReportData.technicalScore,
        fluencyScore: finalReportData.fluencyScore,
        paceScore: finalReportData.paceScore,
        confidenceScore: finalReportData.confidenceScore,
        communicationScore: finalReportData.communicationScore,
        grade: finalReportData.grade,
        executiveSummary: finalReportData.executiveSummary,
        strengths: finalReportData.strengths,
        weaknesses: finalReportData.weaknesses,
        skillGaps: finalReportData.skillGaps,
        recommendedTopics: finalReportData.recommendedTopics,
        nextRecommendedDifficulty: finalReportData.nextRecommendedDifficulty,
        questionSummaries: finalReportData.questionSummaries,
      },
      { upsert: true, new: true }
    );

    // Save Recommendations
    if (resultState.recommendations && resultState.recommendations.length > 0) {
      for (const rec of resultState.recommendations) {
        await Recommendation.create({
          clerkUserId,
          interviewId: interview._id,
          category: rec.category,
          skill: rec.skill,
          title: rec.title,
          priority: rec.priority,
          reason: rec.reason,
          action: rec.action,
          resourceUrl: rec.resourceUrl,
          resourceType: rec.resourceType,
          estimatedHours: rec.estimatedHours,
          difficulty: rec.difficulty,
        });
      }
    }

    interview.status = 'completed';
    interview.compositeScore = finalReportData.overallScore;
    interview.grade = finalReportData.grade;
    interview.completedAt = new Date();
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        report: reportDoc,
        recommendations: resultState.recommendations,
      },
      message: 'Interview completed and report generated successfully.',
    });
  } catch (error) {
    next(error);
  }
}
