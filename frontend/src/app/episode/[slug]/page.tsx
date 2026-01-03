import React from 'react';

export default function EpisodeSlugPage({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Episode Detail Coming Soon</h1>
      <p>Episode: {params.slug}</p>
      <p>This will show the full transcript with audio player.</p>
    </div>
  );
}
