// V0 App metadata utilities (replacing Next.js metadata)
export interface V0Metadata {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    image?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export function setV0Metadata(metadata: V0Metadata): void {
  if (metadata.title) {
    document.title = metadata.title;
  }

  // Update or create meta description
  if (metadata.description) {
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = metadata.description;
  }

  // Update keywords
  if (metadata.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = metadata.keywords.join(', ');
  }

  // Update Open Graph metadata
  if (metadata.openGraph) {
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle && metadata.openGraph.title) {
      ogTitle.content = metadata.openGraph.title;
    }

    const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDesc && metadata.openGraph.description) {
      ogDesc.content = metadata.openGraph.description;
    }
  }
}
