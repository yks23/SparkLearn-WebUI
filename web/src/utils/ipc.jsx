//搞个玩玩，还没连后端
export const invoke = (cmd, arg) => {
  return fetch(`/api/${cmd}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then(r => r.json());
};