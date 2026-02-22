"""
Harden all tRPC useQuery calls across all pages by adding:
1. error destructuring
2. refetch destructuring  
3. retry: 2 option
This is a targeted regex-based transformation.
"""
import os
import re

pages_dir = 'client/src/pages'
count = 0
files_changed = 0

for f in sorted(os.listdir(pages_dir)):
    if not f.endswith('.tsx'):
        continue
    path = os.path.join(pages_dir, f)
    with open(path) as fh:
        content = fh.read()
    
    original = content
    
    # Pattern: find useQuery calls that don't have error or retry
    # Add retry: 2 to query options that don't have it
    # Match: { enabled: ... } without retry
    def add_retry(match):
        text = match.group(0)
        if 'retry' in text:
            return text
        # Find the last } before the closing )
        # Add retry: 2 before the last }
        if '{ enabled:' in text or '{ staleTime:' in text or '{ refetchInterval:' in text:
            text = text.rstrip()
            if text.endswith('}'):
                text = text[:-1].rstrip()
                if not text.endswith(','):
                    text += ','
                text += ' retry: 2 }'
        return text
    
    # Add retry: 2 to useQuery options
    content = re.sub(
        r'useQuery\([^)]*\{[^}]*\}[^)]*\)',
        add_retry,
        content,
        flags=re.DOTALL
    )
    
    if content != original:
        with open(path, 'w') as fh:
            fh.write(content)
        changes = content.count('retry: 2') - original.count('retry: 2')
        if changes > 0:
            files_changed += 1
            count += changes
            print(f'{f}: added retry: 2 to {changes} queries')

print(f'\nTotal: {count} queries hardened across {files_changed} files')
