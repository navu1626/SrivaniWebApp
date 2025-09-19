import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api, { ApiResponse } from '../../services/api';
import { format } from 'date-fns';

interface CompetitionLite {
  CompetitionID: string;
  Title: string;
  TitleHindi?: string;
  StartDate: string;
  EndDate: string;
}

interface RecipientRow {
  UserID: string;
  FirstName: string;
  LastName: string;
  FullName?: string;
  MobileNumber?: string | null;
  Gender?: string | null;
  City?: string | null;
  State?: string | null;
  MessageSent?: number; // 0/1
  SentDateTime?: string | null;
}

const defaultTemplate = (c?: CompetitionLite, descHi?: string) => {
  const start = c?.StartDate ? format(new Date(c.StartDate), 'dd MMM yyyy') : '';
  const end = c?.EndDate ? format(new Date(c.EndDate), 'dd MMM yyyy') : '';
  return `🙏 जय जिनेन्द्र 🙏\n\nबड़े हर्ष का विषय है कि जैन धार्मिक प्रतियोगिता का आयोजन किया जा रहा है। कृपया इसमें भाग लेकर धर्म लाभ अवश्य लें।\n\n🏆 प्रतियोगिता का नाम: ${c?.TitleHindi || c?.Title || ''}\nℹ️ प्रतियोगिता के बारे में: ${descHi || ''}\n📅 आरंभ तिथि: ${start}\n📅 समाप्ति तिथि: ${end}\n\nआइए, हम सब मिलकर इस अवसर को सफल बनाएं और अपने ज्ञान व संस्कारों को और प्रखर करें।\n\n🙏 जय जिनेन्द्र 🙏`;
};

const NotificationsManager: React.FC = () => {
  const [competitions, setCompetitions] = useState<CompetitionLite[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedComp, setSelectedComp] = useState<CompetitionLite | undefined>();
  const [descHiMap, setDescHiMap] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ sent: number; total: number }>({ sent: 0, total: 0 });
  const [error, setError] = useState<string>('');

  // Load published competitions
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ApiResponse<CompetitionLite[]>>('/notifications/competitions');
        if (res.data.success && res.data.data) {
          setCompetitions(res.data.data);
        }
      } catch (e: any) {
        console.error('Failed to load competitions', e);
      }
    })();
  }, []);

  // When selected competition changes, fetch recipients and prefill message
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const comp = competitions.find(c => c.CompetitionID === selectedId);
        setSelectedComp(comp);

        // Load Hindi description to include in template (from public competition endpoint)
        try {
          const compRes = await api.get<ApiResponse<any>>(`/competitions/${selectedId}`);
          const d = compRes.data?.data;
          if (d?.DescriptionHindi) {
            setDescHiMap(prev => ({ ...prev, [selectedId]: d.DescriptionHindi }));
          }
          setMessage(defaultTemplate(comp, d?.DescriptionHindi));
        } catch {
          setMessage(defaultTemplate(comp));
        }

        const recRes = await api.get<ApiResponse<RecipientRow[]>>('/notifications/recipients', { params: { competitionId: selectedId } });
        const rows = recRes.data.data || [];
        setRecipients(rows);
        const sel: Record<string, boolean> = {};
        rows.forEach(r => (sel[r.UserID] = false));
        setSelected(sel);
        setSelectAll(false);
      } catch (e: any) {
        setError(e?.message || 'Failed to load recipients');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]);

  const toggleSelectAll = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    const next: Record<string, boolean> = {};
    recipients.forEach(r => (next[r.UserID] = newVal));
    setSelected(next);
  };

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const handleSend = async () => {
    if (!selectedId) return;
    const userIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!userIds.length) {
      alert('Please select at least one user');
      return;
    }
    setSending(true);
    setProgress({ sent: 0, total: userIds.length });
    try {
      const res = await api.post<ApiResponse<any>>('/notifications/send', { competitionId: selectedId, userIds, message });
      if (res.data.success) {
        const sent = res.data.data?.sent || 0;
        setProgress({ sent, total: userIds.length });
        // Refresh recipients to update status
        const recRes = await api.get<ApiResponse<RecipientRow[]>>('/notifications/recipients', { params: { competitionId: selectedId } });
        setRecipients(recRes.data.data || []);
        alert(res.data.message || `Sent ${sent}/${userIds.length}`);
      } else {
        alert(res.data.message || 'Failed to send messages');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-maroon-800">Manage Notification</h1>
        <p className="text-maroon-600">Send WhatsApp notification to users for a published competition</p>
      </div>

      {/* Competition selector */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <label className="block text-sm font-medium text-maroon-700 mb-2">Competitions (Published)</label>
        <select
          className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a competition</option>
          {competitions.map((c) => {
            const title = c.TitleHindi || c.Title || '';
            const short = title.length > 50 ? `${title.slice(0, 50)}...` : title;
            const range = `${format(new Date(c.StartDate), 'dd MMM yyyy')} -- ${format(new Date(c.EndDate), 'dd MMM yyyy')}`;
            return (
              <option key={c.CompetitionID} value={c.CompetitionID}>
                [{short}] {range}
              </option>
            );
          })}
        </select>
      </div>

      {/* Message editor */}
      {selectedId && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <label className="block text-sm font-medium text-maroon-700 mb-2">Message (WhatsApp)</label>
          <textarea
            className="w-full min-h-[180px] px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 font-[system-ui] whitespace-pre-wrap"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      )}

      {/* Recipients grid */}
      {selectedId && (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span className="text-sm text-maroon-700">Select All</span>
              <span className="text-sm text-maroon-600">Selected: {selectedCount}</span>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !selectedCount}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${sending || !selectedCount ? 'bg-gray-400 cursor-not-allowed' : 'bg-saffron-600 hover:bg-saffron-700'}`}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>

          {/* Progress */}
          {sending && (
            <div className="w-full bg-cream-200 h-2 rounded mb-4">
              <div className="h-2 bg-saffron-600 rounded" style={{ width: `${(progress.sent / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cream-200">
              <thead className="bg-cream-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">Select</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">User Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">Mobile No.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">Gender</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">City</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">State</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-maroon-600 uppercase tracking-wider">Message Sent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cream-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-maroon-600">Loading…</td></tr>
                ) : recipients.length ? (
                  recipients.map(r => (
                    <tr key={r.UserID} className="hover:bg-cream-50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={!!selected[r.UserID]}
                          onChange={(e) => setSelected(prev => ({ ...prev, [r.UserID]: e.target.checked }))}
                        />
                      </td>
                      <td className="px-3 py-2 text-maroon-800">{r.FullName || `${r.FirstName} ${r.LastName}`}</td>
                      <td className="px-3 py-2">{r.MobileNumber || '-'}</td>
                      <td className="px-3 py-2">{r.Gender || '-'}</td>
                      <td className="px-3 py-2">{r.City || '-'}</td>
                      <td className="px-3 py-2">{r.State || '-'}</td>
                      <td className={`px-3 py-2 font-medium ${r.MessageSent ? 'text-green-600' : 'text-maroon-700'}`}>{r.MessageSent ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-maroon-600">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end mt-4">
            <button
              onClick={handleSend}
              disabled={sending || !selectedCount}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${sending || !selectedCount ? 'bg-gray-400 cursor-not-allowed' : 'bg-saffron-600 hover:bg-saffron-700'}`}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;

