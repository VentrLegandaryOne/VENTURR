"""
Harden all frontend pages by adding QueryWrapper import where missing.
This script adds the import statement - manual wrapping of query results
will be done per-page for the most critical pages.
"""
import os
import re

pages_dir = 'client/src/pages'
IMPORT_LINE = 'import { QueryWrapper } from "@/components/ui/QueryWrapper";\n'

count = 0
for f in sorted(os.listdir(pages_dir)):
    if not f.endswith('.tsx'):
        continue
    path = os.path.join(pages_dir, f)
    with open(path) as fh:
        content = fh.read()
    
    # Skip if already has QueryWrapper
    if 'QueryWrapper' in content:
        continue
    
    # Only add to files that use queries
    if 'useQuery' not in content and 'useMutation' not in content:
        continue
    
    # Add import after last import statement
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import ') or line.startswith('} from '):
            last_import_idx = i
    
    lines.insert(last_import_idx + 1, IMPORT_LINE.rstrip())
    
    with open(path, 'w') as fh:
        fh.write('\n'.join(lines))
    
    count += 1
    print(f'Added QueryWrapper import to {f}')

print(f'\nTotal files updated: {count}')
