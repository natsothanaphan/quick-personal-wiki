const parse = (text) => {
  const N = text.length;
  const result = [];
  let buffer = '', inLink = false;
  const pushBuffer = () => {
    if (!buffer) return;
    if (!inLink) { result.push({type: 'text', text: buffer}); buffer = ''; return; }
    const sepInd = buffer.indexOf('|');
    if (sepInd === -1) { result.push({type: 'link', url: buffer, text: buffer}); buffer = ''; return; }
    result.push({type: 'link', url: buffer.slice(0, sepInd), text: buffer.slice(sepInd+1)}); buffer = ''; return;
  };
  let i = 0, c = '', esc = false;
  while (i < N) {
    c = text[i];
    if (c === '\\' && i+1 < N) { c = text[++i]; esc = true; }
    else esc = false;
    if (!inLink) {
      if (!esc && c === '[' && text[i+1] === '[') { pushBuffer(); inLink = true; i += 2; continue; }
      buffer += c; i += 1; continue;
    }
    if (!esc && c === ']' && text[i+1] === ']') { pushBuffer(); inLink = false; i += 2; continue; }
    buffer += c; i += 1; continue;
  }
  pushBuffer();
  return result;
};

export default { parse };
