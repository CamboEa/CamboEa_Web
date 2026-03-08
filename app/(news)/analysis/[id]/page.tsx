// CamboEA - Redirect old signal detail URLs to analysis (bias table)

import { redirect } from 'next/navigation';

export default function AnalysisIdPage() {
  redirect('/analysis');
}
