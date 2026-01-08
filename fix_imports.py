import os
import re

root_dirs = ['app', 'src', 'components', 'scripts']
replacements = [
    (r'from\s+[\'"](\.\./)*lib/supabase[\'"]', "from '@/lib/supabase'"),
    (r'from\s+[\'"](\.\./)*lib/supabaseServer[\'"]', "from '@/lib/supabaseServer'"),
]

print("Starting replacement...")
for root_dir in root_dirs:
    if not os.path.exists(root_dir):
        print(f"Skipping {root_dir} (not found)")
        continue
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for pattern, replacement in replacements:
                        new_content = re.sub(pattern, replacement, new_content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")
print("Done.")
