// Stub file - the full DesignReview.dev.tsx is gitignored for development only
// This minimal version ships with the repo so the app builds
//
// TO USE FULL DESIGN REVIEW LOCALLY:
// 1. Rename DesignReview.tsx to DesignReview.dev.tsx
// 2. In App.tsx, change import from './DesignReview.stub' to './DesignReview.dev'
// 3. Add 'src/DesignReview.dev.tsx' to .gitignore

interface DesignReviewProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function DesignReview(_props: DesignReviewProps) {
  // Empty component - full version only available in development
  return <></>;
}

