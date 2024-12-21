

import dynamic from 'next/dynamic';

const DaisyUIStudyPlanTracker = dynamic(() => import('./components/DaisyUIStudyPlanTracker'));
export default function Home() {
  return (
    <main className="min-h-screen bg-base-200">
      <DaisyUIStudyPlanTracker />
    </main>
  )
}

