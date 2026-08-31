import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { ArrowRight, Clock, Plus } from 'lucide-react';

export function RecentInterviews({ interviews = [] }) {
  const getBadgeVariant = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'in_progress') return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Mock Interviews</CardTitle>
        <Link to="/interview/setup">
          <Button variant="outline" size="sm" className="gap-1">
            <Plus size={13} />
            <span>New Session</span>
          </Button>
        </Link>
      </CardHeader>

      {interviews.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          <p>No mock interviews found.</p>
          <Link to="/interview/setup" className="text-indigo-400 hover:underline mt-1 inline-block">
            Start your first mock interview
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {interviews.slice(0, 5).map((interview) => (
            <div key={interview._id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{interview.targetRole}</span>
                  <Badge variant={getBadgeVariant(interview.status)} size="xs">
                    {interview.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span>{interview.experience}</span>
                  <span>·</span>
                  <span>{interview.difficulty}</span>
                  {interview.compositeScore > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-slate-300 font-medium code-font">
                        Score: {interview.compositeScore}% ({interview.grade})
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {interview.status === 'completed' ? (
                  <Link to={`/reports/${interview._id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-indigo-400 hover:text-indigo-300">
                      <span>Report</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/interview/${interview._id}`}>
                    <Button variant="secondary" size="sm">
                      <span>Resume</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
