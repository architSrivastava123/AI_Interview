import React from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { FileText, Trash2, Cpu } from 'lucide-react';

export function ResumeCard({ resume, onDelete }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-slate-800 text-indigo-400 border border-slate-700 mt-0.5">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{resume.filename}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{resume.targetRole}</span>
              <span>·</span>
              <span className="code-font text-slate-500">{resume.chunks?.length || 0} vector chunks</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(resume._id)}
          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
          title="Delete Resume"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {resume.parsedSkills && resume.parsedSkills.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Cpu size={11} /> Skills:
          </span>
          {resume.parsedSkills.map((skill, i) => (
            <Badge key={i} variant="default" size="xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
