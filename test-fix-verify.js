// 回歸測試：app.js 結束判定邏輯（收緊後）。
// 確保雨停/中斷/延賽不會被誤報成「比賽結束」，只有真正 FT 或場次消失才通知結束。
// 執行：~/.nvm/versions/node/v20.20.2/bin/node test-fix-verify.js

// 與 app.js 結束判定核心邏輯對齊的純函式版本
function endDecision(oldSnap, current) {
  const looksEnded = !current || current.status === '比賽結束';
  const wasLive = oldSnap.status === '比賽中' || oldSnap.status === '比賽暫停';
  if (oldSnap.pendingEnd) {
    return looksEnded ? 'NOTIFY_END' : 'CLEAR_PENDING';
  }
  if (!wasLive) return 'SKIP';
  return looksEnded ? 'MARK_PENDING' : 'NOTHING';
}

function assert(name, got, want) {
  const ok = got === want;
  console.log(`${ok ? '✅' : '❌'} ${name}: got=${got} want=${want}`);
  if (!ok) process.exitCode = 1;
}

// 味全案例：比賽中 → 雨停(暫停) 不該結束
assert('比賽中→比賽暫停(雨停) 不標記結束',
  endDecision({ status: '比賽中', scoreKey: '1:0' }, { status: '比賽暫停', scoreKey: '1:0' }), 'NOTHING');
// 比賽中 → 真的 FT，標記疑似結束
assert('比賽中→比賽結束(FT) 標記待確認',
  endDecision({ status: '比賽中', scoreKey: '1:1' }, { status: '比賽結束', scoreKey: '1:2' }), 'MARK_PENDING');
// 二次確認仍 FT → 發結束通知
assert('待確認+仍FT → 發結束通知',
  endDecision({ status: '比賽中', scoreKey: '1:2', pendingEnd: true }, { status: '比賽結束', scoreKey: '1:2' }), 'NOTIFY_END');
// 樂天案例：比賽暫停 → 之後變延賽(POST) 不該誤報結束
assert('比賽暫停→延賽 不標記結束',
  endDecision({ status: '比賽暫停', scoreKey: '0:0' }, { status: '延賽', scoreKey: '0:0' }), 'NOTHING');
// 待確認時其實仍是暫停(雨停) → 清除誤判
assert('待確認+其實仍暫停 → 清除誤判',
  endDecision({ status: '比賽中', scoreKey: '1:0', pendingEnd: true }, { status: '比賽暫停', scoreKey: '1:0' }), 'CLEAR_PENDING');
// 場次從列表消失（二次確認）→ 視為結束
assert('待確認+場次消失 → 發結束通知',
  endDecision({ status: '比賽中', scoreKey: '3:2', pendingEnd: true }, undefined), 'NOTIFY_END');
