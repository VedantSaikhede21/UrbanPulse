import json
from pathlib import Path

uncached = [line.strip() for line in Path('graphify-out/.graphify_uncached.txt').read_text(encoding="utf-8").splitlines() if line.strip()]

# Separate images and docs
images = [f for f in uncached if f.lower().endswith(('.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'))]
docs = [f for f in uncached if f not in images]

print(f"Images: {len(images)}, Docs: {len(docs)}")

chunks = []
chunk_num = 1

# Each image gets its own chunk
for img in images:
    chunks.append({
        'num': chunk_num,
        'files': [img],
        'type': 'image'
    })
    chunk_num += 1

# Group docs by directory, then split into chunks of ~22
from collections import defaultdict
by_dir = defaultdict(list)
for d in docs:
    p = Path(d)
    parent = str(p.parent)
    by_dir[parent].append(d)

# Flatten grouped by directory
grouped_docs = []
for dir_path, files in by_dir.items():
    grouped_docs.extend(files)

# Split into chunks of ~22
CHUNK_SIZE = 22
for i in range(0, len(grouped_docs), CHUNK_SIZE):
    chunk_files = grouped_docs[i:i+CHUNK_SIZE]
    chunks.append({
        'num': chunk_num,
        'files': chunk_files,
        'type': 'document'
    })
    chunk_num += 1

print(f"Total chunks: {len(chunks)}")

# Write chunk files
PROJECT_ROOT = Path('.').resolve()
for chunk in chunks:
    chunk_path = PROJECT_ROOT / f"graphify-out/.graphify_chunk_{chunk['num']:02d}.json"
    chunk_data = {
        'files': chunk['files'],
        'chunk_num': chunk['num'],
        'total_chunks': len(chunks),
        'deep_mode': False,
        'chunk_path': str(chunk_path)
    }
    chunk_path.write_text(json.dumps(chunk_data, indent=2, ensure_ascii=False), encoding="utf-8")

# Print summary
for chunk in chunks:
    print(f"Chunk {chunk['num']:02d}: {len(chunk['files'])} files ({chunk['type']}) - {chunk['files'][:3]}...")