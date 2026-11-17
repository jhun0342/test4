import { useState } from 'react';
import { api } from './api';

export function InviteGate({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (await api.redeemInvite(code)) onDone();
    else setError('유효하지 않은 초대 코드예요.');
  };

  return (
    <div className="screen">
      <main className="content">
        <h1>초대받은 분만 들어올 수 있어요</h1>
        <p className="muted">서로 안심하고 대화할 수 있도록, 지금은 초대 코드가 있는 분께만 열려 있어요.</p>
        <label>
          초대 코드
          <input value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} placeholder="예: GYEOL-BETA" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </label>
        {error && <div className="notice warn">{error}</div>}
        <button className="btn" disabled={!code.trim()} onClick={submit}>입장하기</button>
      </main>
    </div>
  );
}
