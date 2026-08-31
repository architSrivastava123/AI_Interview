import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Award, ExternalLink, CheckCircle2, Circle, Clock, BookOpen, Target } from 'lucide-react';

export default function PracticeRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await recommendationService.list();
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await recommendationService.toggle(id);
      setRecommendations((prev) =>
        prev.map((rec) => (rec._id === id ? res.data : rec))
      );
    } catch (err) {
      console.error('Failed to toggle recommendation status:', err);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge variant="danger" size="xs">High Priority</Badge>;
      case 'medium': return <Badge variant="warning" size="xs">Medium Priority</Badge>;
      case 'low': return <Badge variant="default" size="xs">Optional</Badge>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Personalized Practice Plan"
        description="Actionable study topics, documentation drills, and focus areas generated dynamically from your skill gaps."
        actions={
          <Link to="/interview/setup">
            <Button variant="primary" size="sm">Start Practice Session</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <LoadingSpinner text="Generating tailored practice curriculum..." />
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400 mb-3">
            <Award size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">No practice items yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Complete a mock interview session to automatically generate personalized skill-gap practice plans.
          </p>
          <Link to="/interview/setup">
            <Button variant="primary" size="sm">Launch First Session</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card
              key={rec._id}
              className={`transition-all ${
                rec.isCompleted
                  ? 'opacity-60 bg-slate-950/40 border-slate-800'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-grow">
                  <button
                    onClick={() => handleToggle(rec._id)}
                    className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {rec.isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          rec.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {rec.title}
                      </h3>
                      {getPriorityBadge(rec.priority)}
                      <Badge variant="default" size="xs">
                        {rec.skill}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Why: </strong>
                      {rec.reason}
                    </p>

                    <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs text-indigo-300">
                      <strong className="text-slate-200">Action Plan: </strong>
                      {rec.action}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      {rec.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>~{rec.estimatedHours} hours</span>
                        </div>
                      )}
                      {rec.resourceUrl && (
                        <a
                          href={rec.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          <span>{rec.resourceType || 'Resource'} Documentation</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
