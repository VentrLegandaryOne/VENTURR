"""
Harden all tRPC useQuery calls by:
1. Adding error + refetch destructuring where missing
2. Adding retry: 2 to query options where missing
"""
import os
import re

pages_dir = 'client/src/pages'
total_error_added = 0
total_retry_added = 0
files_changed = 0

for f in sorted(os.listdir(pages_dir)):
    if not f.endswith('.tsx'):
        continue
    path = os.path.join(pages_dir, f)
    with open(path) as fh:
        content = fh.read()
    
    original = content
    
    # 1. Add error destructuring to useQuery destructuring patterns
    # Pattern: { data: xxx, isLoading: xxx } = trpc...useQuery
    # But NOT if error is already there
    def add_error_destructure(match):
        text = match.group(0)
        if 'error' in text:
            return text
        # Add error before the closing }
        idx = text.rindex('}')
        prefix = text[:idx].rstrip()
        if not prefix.endswith(','):
            prefix += ','
        # Generate a unique error name based on the data alias
        data_match = re.search(r'data:\s*(\w+)', text)
        if data_match:
            data_name = data_match.group(1)
            # Create camelCase error name
            error_name = f'error{data_name[0].upper()}{data_name[1:]}' if len(data_name) > 1 else f'error{data_name.upper()}'
        else:
            error_name = 'error'
        return f'{prefix} error: {error_name} {text[idx:]}'
    
    # Match destructuring pattern before useQuery
    content = re.sub(
        r'\{[^}]*isLoading[^}]*\}\s*=\s*\n?\s*trpc\.\w+\.\w+\.useQuery',
        add_error_destructure,
        content
    )
    
    # Also match: const { data } = trpc...useQuery (without isLoading)
    content = re.sub(
        r'\{\s*data[^}]*\}\s*=\s*\n?\s*trpc\.\w+\.\w+\.useQuery',
        add_error_destructure,
        content
    )
    
    # 2. Add retry: 2 to useQuery options
    # Find useQuery( ... { enabled: ... } ) and add retry: 2
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this line has useQuery with options object on same or next lines
        if 'useQuery(' in line or 'useQuery(' in (lines[i-1] if i > 0 else ''):
            # Look ahead for the options closing
            j = i
            block = ''
            paren_depth = 0
            found_usequery = False
            while j < len(lines) and j < i + 15:
                block += lines[j] + '\n'
                if 'useQuery(' in lines[j]:
                    found_usequery = True
                if found_usequery:
                    paren_depth += lines[j].count('(') - lines[j].count(')')
                    if paren_depth <= 0 and found_usequery:
                        break
                j += 1
            
            if found_usequery and 'retry' not in block:
                # Find the line with enabled: or staleTime: etc and add retry
                for k in range(i, min(j+1, len(lines))):
                    if ('enabled:' in lines[k] or 'staleTime:' in lines[k] or 'refetchInterval:' in lines[k]) and 'retry' not in lines[k]:
                        # Add retry: 2 after the existing option
                        stripped = lines[k].rstrip()
                        if stripped.endswith(','):
                            lines[k] = stripped + ' retry: 2,'
                        elif stripped.endswith('}'):
                            lines[k] = stripped[:-1].rstrip()
                            if not lines[k].endswith(','):
                                lines[k] += ','
                            lines[k] += ' retry: 2 }'
                        else:
                            lines[k] = stripped + ', retry: 2,'  
                        total_retry_added += 1
                        break
        i += 1
    
    content = '\n'.join(lines)
    
    error_added = content.count('error') - original.count('error')
    
    if content != original:
        with open(path, 'w') as fh:
            fh.write(content)
        files_changed += 1
        total_error_added += error_added
        print(f'{f}: hardened (errors: +{error_added}, retries: added)')

print(f'\nTotal: {files_changed} files hardened')
