import { useCallback, useEffect, useState } from 'react';
import { ASSET_BANDS, LIFESTYLES, RISK_LEVELS, type Profile } from '../core/types';
import { api } from './api';
import { Onboarding } from './Onboarding';
import { Recommendations } from './Recommendations';
import { Matches } from './Matches';
import { InviteGate } from './InviteGate';

type Tab = 'home' | 'chat' | 'me';

export function App() {
  const [me, setMe] = useState<Profile | null | undefined>(undefined);
  const [invited, setInvited] = useState<boolean | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('home');
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(async () => {
    setInvited(await api.hasInvite());
    setMe(await api.getMe());
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  if (me === undefined || invited === undefined) return <div className="screen" />;
  if (!invited) return <InviteGate onDone={refresh} />;
  if (!me || editing) {
    return (
      <Onboarding
        initial={me ?? undefined}
        onDone={async (p) => { await api.saveMe(p); setEditing(false); await refresh(); }}
      />
    );
  }

  return (
    <div className="screen">
      <main className="content">
        {tab === 'home' && <Recommendations />}
        {tab === 'chat' && <Matches />}
        {tab === 'me' && (
          <section>
            <h1>내 프로필</h1>
            <div className="card">
              <b>{me.nickname}, {me.age}</b>
              <p className="muted">투자 {RISK_LEVELS[me.risk]} · 소비 {LIFESTYLES[me.lifestyle]}</p>
              <p className="muted">자산 구간(자기 신고): {me.assetBand === null ? '입력 안 함' : ASSET_BANDS[me.assetBand].label}</p>
              <p>{me.intro}</p>
              <div className="tags">{me.interests.map((i) => <span key={i} className="tag">{i}</span>)}</div>
              <p className="muted">선호: {me.mode === 'similar' ? '비슷한 분야' : '다른 분야'}</p>
            </div>
            <button className="btn secondary" onClick={() => setEditing(true)}>프로필 수정</button>
            <button
              className="btn ghost"
              onClick={async () => { await api.reset(); setTab('home'); await refresh(); }}
            >
              데이터 초기화 (테스트용)
            </button>
          </section>
        )}
      </main>
      <nav className="tabbar">
        {([['home', '추천'], ['chat', '대화'], ['me', '내 정보']] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </nav>
    </div>
  );
}
