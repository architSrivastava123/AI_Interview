/**
 * analyticsController.js
 * Express controller for computing dashboard analytics, trends, readiness, and breakdown.
 */

import { Report } from '../models/Report.js';
import { Interview } from '../models/Interview.js';
import moment from 'moment';

/**
 * GET /api/analytics
 * Aggregates candidate readiness and performance trends.
 */
export async function getAnalytics(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;

    const reports = await Report.find({ clerkUserId }).sort({ createdAt: 1 }).lean();
    const totalInterviews = await Interview.countDocuments({ clerkUserId, status: 'completed' });

    if (!reports || reports.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalInterviews: 0,
          readinessScore: 0,
          averageScores: {
            technical: 0,
            fluency: 0,
            pace: 0,
            confidence: 0,
            communication: 0,
            overall: 0,
          },
          performanceTrend: [],
          domainBreakdown: [],
          strongSkills: [],
          weakSkills: [],
          streakDays: 0,
        },
      });
    }

    const count = reports.length;
    const avg = (dim) => Math.round(reports.reduce((sum, r) => sum + (r[dim] || 0), 0) / count);

    const averageScores = {
      technical: avg('technicalScore'),
      fluency: avg('fluencyScore'),
      pace: avg('paceScore'),
      confidence: avg('confidenceScore'),
      communication: avg('communicationScore'),
      overall: avg('overallScore'),
    };

    // Performance trend for line chart
    const performanceTrend = reports.map(r => ({
      date: moment(r.createdAt).format('MMM DD'),
      score: r.overallScore,
      targetRole: r.targetRole,
      grade: r.grade,
      interviewId: r.interviewId,
    }));

    // Domain breakdown
    const domainMap = {};
    for (const r of reports) {
      const domain = r.targetRole || 'General';
      if (!domainMap[domain]) {
        domainMap[domain] = { domain, count: 0, totalScore: 0 };
      }
      domainMap[domain].count += 1;
      domainMap[domain].totalScore += r.overallScore;
    }

    const domainBreakdown = Object.values(domainMap).map(d => ({
      domain: d.domain,
      count: d.count,
      avgScore: Math.round(d.totalScore / d.count),
    }));

    // Strengths & Weaknesses
    const allGaps = reports.flatMap(r => r.skillGaps || []);
    const strongSkills = Array.from(new Set(allGaps.filter(g => g.status === 'strong').map(g => g.dimension)));
    const weakSkills = Array.from(new Set(allGaps.filter(g => g.status === 'critical' || g.status === 'needs-work').map(g => g.dimension)));

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        readinessScore: averageScores.overall,
        averageScores,
        performanceTrend,
        domainBreakdown,
        strongSkills,
        weakSkills,
        streakDays: Math.min(count, 5),
      },
    });
  } catch (error) {
    next(error);
  }
}
