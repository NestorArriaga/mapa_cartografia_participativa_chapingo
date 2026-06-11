import React, { useEffect, useState } from 'react';
import { submissionService } from '../../services/submissionService';
import { ParticipatorySubmission } from '../../types/submissions';
import { SubmissionInspector } from './SubmissionInspector';

export const ReviewTable: React.FC = () => {
  const [submissions, setSubmissions] = useState<ParticipatorySubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<ParticipatorySubmission | null>(null);

  const fetchSubs = async () => {
    const subs = await submissionService.list();
    setSubmissions(subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'under_review') return 'text-mapCoral';
    if (status === 'pending') return 'text-mapAmber';
    if (status === 'approved_public_aggregated') return 'text-mapCyan';
    return 'text-textSecondary';
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 max-h-[60vh] overflow-y-auto custom-scrollbar border border-white/10 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-white/5 text-textSecondary sticky top-0">
            <tr>
              <th className="p-3 font-medium border-b border-white/10">Fecha</th>
              <th className="p-3 font-medium border-b border-white/10">Tipo</th>
              <th className="p-3 font-medium border-b border-white/10">Zona</th>
              <th className="p-3 font-medium border-b border-white/10">Estado</th>
              <th className="p-3 font-medium border-b border-white/10">Acción</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 text-textMuted">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-white">{sub.submissionType}</td>
                <td className="p-3 text-white truncate max-w-[150px]">{sub.zoneName || '—'}</td>
                <td className={`p-3 font-medium ${getStatusColor(sub.status)}`}>{sub.status}</td>
                <td className="p-3">
                  <button 
                    onClick={() => setSelectedSub(sub)}
                    className="text-mapCyan hover:underline text-xs"
                  >
                    Inspeccionar
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-textMuted">No hay aportaciones locales.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedSub && (
        <SubmissionInspector 
          submission={selectedSub} 
          onClose={() => setSelectedSub(null)} 
          onUpdated={fetchSubs}
        />
      )}
    </div>
  );
};
