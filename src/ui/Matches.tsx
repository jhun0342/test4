import { useEffect, useState } from 'react';
import { daysLeft, isChatOpen } from '../core/chat';
import type { Match, Message, Profile } from '../core/types';
import { api } from './api';

type Item = { match: Match; partner: Profile };

export function Matches() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => { void api.listMatches().then(setItems); }, []);
  if (open) return <Chat item={open} onBack={() => setOpen(null)} />;
  if (!items) return <p className="muted">불러오는 중…</p>;

  return (
    <section>
      <h1>대화</h1>
      {items.length === 0 && <p className="muted">아직 연결된 분이 없어요. 추천 탭에서 관심을 표현해보세요.</p>}
      {items.map((it) => (
        <button key={it.match.id} className="card listitem" onClick={() => setOpen(it)}>
          <b>{it.partner.nickname}</b>
          <span className="muted">{isChatOpen(it.match) ? `${daysLeft(it.match)}일 남음` : '종료됨'}</span>
        </button>
      ))}
    </section>
  );
}

function Chat({ item, onBack }: { item: Item; onBack: () => void }) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const load = async () => setMsgs(await api.listMessages(item.match.id));
  useEffect(() => { void load(); }, []);

  const send = async () => {
    const r = await api.sendMessage(item.match.id, text);
    if (r.ok) { setText(''); setError(''); await load(); } else setError(r.reason);
  };

  const open = isChatOpen(item.match);
  return (
    <section>
      <button className="btn ghost" onClick={onBack}>← 목록</button>
      <h1>{item.partner.nickname}</h1>
      <p className="muted">{open ? `${daysLeft(item.match)}일 뒤 대화가 종료돼요. 외부 링크·계좌번호는 보낼 수 없어요.` : '대화 기간이 끝났어요.'}</p>
      <div className="msgs">
        {msgs.map((m) => <div key={m.id} className="bubble">{m.text}</div>)}
      </div>
      {error && <div className="notice warn">{error}</div>}
      {open && (
        <div className="row">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지 입력" onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button className="btn small" onClick={send}>보내기</button>
        </div>
      )}
    </section>
  );
}
