# -*- coding: utf-8 -*-
"""字体瘦身：页面只用到少量字符，683 个 woff2 分片大部分用不上。
做法：扫描源码里出现的字符 → 找出覆盖它们的 unicode-range 分片 → 只保留这些。
未覆盖到的字符由系统中文字体兜底（Noto Sans SC / 宋体），不影响观感。
"""
import os, re, glob, urllib.parse

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)  # moon-portfolio/

# 1. 收集页面里所有用到的字符
chars = set()
for f in ['index.html', 'src/main.js', 'src/styles/main.css', 'README.md']:
    p = os.path.join(ROOT, f)
    if os.path.exists(p):
        txt = open(p, encoding='utf-8').read()
        chars.update(txt)
# 加上基础 ASCII 和常用标点/数字
chars.update(chr(c) for c in range(32, 127))
chars.update('，。、；：？！“”‘’（）《》—…·×÷°％℃→←↑↓✿✦★☆')
print(f"页面用到的字符数: {len(chars)}")

# 2. 解析每个字体的 CSS，把分片按 unicode-range 归类
def parse_ranges(css_path):
    css = open(css_path, encoding='utf-8').read()
    blocks = re.findall(r"@font-face\s*\{(.*?)\}", css, re.S)
    out = []
    for b in blocks:
        m_f = re.search(r"url\('([^']+)'\)", b)
        m_ur = re.search(r"unicode-range:\s*([^;]+);", b)
        m_w = re.search(r"font-weight:\s*([^;]+);", b)
        if not m_f:
            continue
        fname = os.path.basename(m_f.group(1))
        ur = m_ur.group(1).strip() if m_ur else None
        weight = m_w.group(1).strip() if m_w else '400'
        out.append({'file': fname, 'ur': ur, 'weight': weight})
    return out

def in_range(cp, spec):
    """判断码点是否落在 unicode-range 描述里"""
    for part in spec.split(','):
        part = part.strip()
        if '?' in part:
            lo_s, hi_s = part.split('-')
            lo = int(lo_s.replace('U+', ''), 16)
            hi = int(hi_s.replace('U+', ''), 16)
            if lo <= cp <= hi:
                return True
        else:
            v = part.replace('U+', '')
            if '-' in v:
                a, b = v.split('-')
                if int(a, 16) <= cp <= int(b, 16):
                    return True
            else:
                if int(v, 16) == cp:
                    return True
    return False

need_cp = {ord(c) for c in chars if ord(c) > 31}

total_removed = 0
for css_file in glob.glob(os.path.join(BASE, '*.css')):
    name = os.path.basename(css_file)
    items = parse_ranges(css_file)
    keep = set()
    for it in items:
        if not it['ur']:
            keep.add(it['file'])
            continue
        if any(in_range(cp, it['ur']) for cp in need_cp):
            keep.add(it['file'])
    removed = 0
    for it in items:
        if it['file'] not in keep:
            fp = os.path.join(BASE, it['file'])
            if os.path.exists(fp):
                removed += os.path.getsize(fp)
                os.remove(fp)
    # 重写 CSS，只留还在的
    css = open(css_file, encoding='utf-8').read()
    blocks = re.findall(r"@font-face\s*\{.*?\}", css, re.S)
    kept_blocks = []
    for b in blocks:
        m_f = re.search(r"url\('([^']+)'\)", b)
        if m_f and os.path.basename(m_f.group(1)) in keep:
            kept_blocks.append(b)
    open(css_file, 'w', encoding='utf-8').write("\n".join(kept_blocks))
    total_removed += removed
    print(f"[{name}] 保留 {len(keep)}/{len(items)} 分片，省 {removed/1024/1024:.1f}MB")

print(f"\n合计节省: {total_removed/1024/1024:.1f}MB")
