import { useEffect, useState } from 'react';
import type { ScoredCandidate } from '../core/matching';
import { ASSET_BANDS } from '../core/types';
import { api } from './api';

export function Recommendations() {
  const [list, setList] = useState<ScoredCandidate[] | null>(null);
  const [notice, setNotice] = useState('');

  const load = async () => setList(await api.getDailyRecommendations());
  useEffect(() => { void load(); }, []);

  const respond = async (id: string, accept: boolean, name: string) => {
    const { matched } = await api.respond(id, accept);
    setNotice(matched ? `${name}님과 연결됐어요! 대화 탭에서 7일 동안 이야기해보세요.` : accept ? `${name}님의 답을 기다리는 중이에요.` : '');
    await load();
  };

  if (!list) return <p className="muted">불러오는 중…</p>;

  return (
    <section>
      <h1>오늘의 추천</h1>
      <p className="muted">하루 3명까지 추천해요. 신중하게 골라보세요.</p>
      {notice && <div className="notice">{notice}</div>}
      {list.length === 0 && <p className="muted">오늘 추천은 모두 확인했어요. 내일 다시 만나요.</p>}
      {list.map(({ profile: p, sharedInterests }) => (
        <article className="card" key={p.id}>
          <div className="row"><b>{p.nickname}, {p.age}</b><span className="band">{ASSET_BANDS[p.assetBand].label}</span></div>
          <p>{p.intro}</p>
          <div className="tags">
            {p.interests.map((i) => <span key={i} className={`tag ${sharedInterests.includes(i) ? 'shared' : ''}`}>{i}</span>)}
          </div>
          <div className="row actions">
            <button className="btn secondary" onClick={() => respond(p.id, false, p.nickname)}>패스</button>
            <button className="btn" onClick={() => respond(p.id, true, p.nickname)}>관심 있어요</button>
          </div>
        </article>
      ))}
    </section>
  );
}
